"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CameraOff,
  CheckCircle2,
  Loader2,
  ScanLine,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatEventDate } from "@/lib/utils";

type EventOption = { id: string; title: string; starts_at: string };

type ScanResult =
  | "valid"
  | "already_used"
  | "cancelled"
  | "wrong_event"
  | "not_found"
  | "error";

interface ScanResponse {
  result?: ScanResult;
  code?: string;
  holder_name?: string;
  seat_label?: string | null;
  scanned_at?: string | null;
  error?: string;
}

const RESULT_META: Record<
  ScanResult,
  { label: string; sub: string; tone: "valid" | "invalid"; Icon: typeof CheckCircle2 }
> = {
  valid: {
    label: "Valid ticket",
    sub: "Admit one. Marked as used.",
    tone: "valid",
    Icon: CheckCircle2,
  },
  already_used: {
    label: "Already used",
    sub: "This ticket was already scanned in.",
    tone: "invalid",
    Icon: AlertTriangle,
  },
  cancelled: {
    label: "Cancelled / refunded",
    sub: "Do not admit. This ticket is void.",
    tone: "invalid",
    Icon: XCircle,
  },
  wrong_event: {
    label: "Wrong event",
    sub: "This ticket is for a different event.",
    tone: "invalid",
    Icon: XCircle,
  },
  not_found: {
    label: "Invalid ticket",
    sub: "No ticket matches this code.",
    tone: "invalid",
    Icon: XCircle,
  },
  error: {
    label: "Scan failed",
    sub: "Something went wrong. Try again.",
    tone: "invalid",
    Icon: XCircle,
  },
};

function extractToken(raw: string): string | null {
  const match = raw
    .trim()
    .match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return match ? match[0] : null;
}

export function StaffScanner({ events }: { events: EventOption[] }) {
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState(false);
  const [response, setResponse] = useState<ScanResponse | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastScan = useRef<{ token: string; at: number } | null>(null);

  const submitToken = useCallback(
    async (token: string) => {
      if (!eventId || busy) return;
      setBusy(true);
      try {
        const res = await fetch("/api/tickets/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qrToken: token, eventId }),
        });
        const data: ScanResponse = await res.json();
        setResponse(data.result ? data : { result: "error", error: data.error });
      } catch {
        setResponse({ result: "error" });
      } finally {
        setBusy(false);
      }
    },
    [eventId, busy]
  );

  const handleManual = () => {
    const token = extractToken(manual);
    if (!token) {
      setResponse({ result: "not_found", error: "That is not a valid ticket code." });
      return;
    }
    submitToken(token);
  };

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    const Detector = (window as any).BarcodeDetector;
    if (!Detector) {
      setCameraError(
        "Live camera scanning isn't supported in this browser. Use manual entry below - it works everywhere."
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);

      const detector = new Detector({ formats: ["qr_code"] });
      const tick = async () => {
        if (!streamRef.current || !videoRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes.length) {
            const token = extractToken(codes[0].rawValue ?? "");
            const now = Date.now();
            if (
              token &&
              (!lastScan.current ||
                lastScan.current.token !== token ||
                now - lastScan.current.at > 2500)
            ) {
              lastScan.current = { token, at: now };
              submitToken(token);
            }
          }
        } catch {
          /* transient detect errors are safe to ignore */
        }
        if (streamRef.current) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    } catch {
      setCameraError("Couldn't access the camera. Check permissions or use manual entry.");
    }
  }, [submitToken]);

  useEffect(() => stopCamera, [stopCamera]);

  const meta = response?.result ? RESULT_META[response.result] : null;

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="event">Scanning for</Label>
        <select
          id="event"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          className="mt-1.5 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {events.length === 0 && <option value="">No published events</option>}
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title} - {formatEventDate(ev.starts_at)}
            </option>
          ))}
        </select>
      </div>

      {meta && (
        <div
          className={
            "flex items-center gap-4 rounded-2xl border p-5 " +
            (meta.tone === "valid"
              ? "border-valid/30 bg-valid/10"
              : "border-invalid/30 bg-invalid/10")
          }
        >
          <meta.Icon
            className={"h-10 w-10 shrink-0 " + (meta.tone === "valid" ? "text-valid" : "text-invalid")}
          />
          <div className="min-w-0">
            <p className="font-display text-xl font-semibold text-ink">{meta.label}</p>
            <p className="text-sm text-ink-muted">{response?.error ?? meta.sub}</p>
            {response?.code && (
              <p className="mt-1 truncate text-xs text-ink-muted">
                {response.code}
                {response.holder_name ? ` - ${response.holder_name}` : ""}
                {response.seat_label ? ` - Seat ${response.seat_label}` : ""}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-line bg-ink/5">
        <div className="relative aspect-[4/3] w-full bg-ink/90">
          <video
            ref={videoRef}
            playsInline
            muted
            className={"h-full w-full object-cover " + (cameraOn ? "" : "hidden")}
          />
          {!cameraOn && (
            <div className="absolute inset-0 grid place-content-center gap-3 text-center text-white/70">
              <ScanLine className="mx-auto h-10 w-10" />
              <p className="text-sm">Point the camera at the ticket QR</p>
            </div>
          )}
          {cameraOn && (
            <div className="pointer-events-none absolute inset-0 grid place-content-center">
              <div className="h-44 w-44 rounded-2xl border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
            </div>
          )}
          {busy && (
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-ink/70 py-2 text-sm text-white">
              <Loader2 className="h-4 w-4 animate-spin" /> Checking...
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 p-3">
          {cameraOn ? (
            <Button variant="outline" size="sm" onClick={stopCamera}>
              <CameraOff className="mr-1.5 h-4 w-4" /> Stop camera
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={startCamera} disabled={!eventId}>
              <ScanLine className="mr-1.5 h-4 w-4" /> Start camera
            </Button>
          )}
          <span className="text-xs text-ink-muted">Tickets flip to used on the first valid scan.</span>
        </div>
      </div>

      {cameraError && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {cameraError}
        </p>
      )}

      <div className="rounded-2xl border border-line bg-white p-4">
        <Label htmlFor="manual">Manual entry</Label>
        <p className="mb-2 mt-0.5 text-xs text-ink-muted">
          Paste the QR token or ticket URL if the camera cannot read it.
        </p>
        <div className="flex gap-2">
          <Input
            id="manual"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="00000000-0000-0000-0000-000000000000"
            onKeyDown={(e) => e.key === "Enter" && handleManual()}
          />
          <Button onClick={handleManual} disabled={busy || !eventId}>
            Check
          </Button>
        </div>
      </div>
    </div>
  );
}