"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Upload, X, Film } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const MAX_VIDEO_BYTES = 200 * 1024 * 1024; // 200 MB
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_GALLERY = 6;

function randomName(file: File) {
  const ext = file.name.split(".").pop() ?? "bin";
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

export interface MediaValue {
  cover_url: string;
  gallery: string[];
  video_url: string;
}

export function MediaUploader({
  value,
  onChange,
}: {
  value: MediaValue;
  onChange: (v: MediaValue) => void;
}) {
  const supabase = createClient();
  const [coverBusy, setCoverBusy] = useState(false);
  const [galleryBusy, setGalleryBusy] = useState(false);
  const [videoBusy, setVideoBusy] = useState(false);

  const coverInput = useRef<HTMLInputElement | null>(null);
  const galleryInput = useRef<HTMLInputElement | null>(null);
  const videoInput = useRef<HTMLInputElement | null>(null);

  async function uploadFile(file: File): Promise<string | null> {
    const { error } = await supabase.storage
      .from("listing-media")
      .upload(randomName(file), file, { cacheControl: "3600", upsert: false });
    if (error) {
      toast.error(error.message);
      return null;
    }
    // Path is the name we generated; re-derive public URL from the last upload.
    // Simpler: re-upload returns nothing useful across versions, so list via getPublicUrl.
    return null;
  }

  // Upload and return the public URL in one step.
  async function put(file: File): Promise<string | null> {
    const path = randomName(file);
    const { error } = await supabase.storage
      .from("listing-media")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) {
      toast.error(error.message);
      return null;
    }
    const { data } = supabase.storage.from("listing-media").getPublicUrl(path);
    return data.publicUrl;
  }

  const onCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Cover must be an image.");
    if (file.size > MAX_IMAGE_BYTES) return toast.error("Cover image must be under 10 MB.");
    setCoverBusy(true);
    const url = await put(file);
    setCoverBusy(false);
    if (url) onChange({ ...value, cover_url: url });
  };

  const onGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    const room = MAX_GALLERY - value.gallery.length;
    if (room <= 0) return toast.error(`Up to ${MAX_GALLERY} gallery images.`);
    setGalleryBusy(true);
    const urls: string[] = [];
    for (const file of files.slice(0, room)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image.`);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error(`${file.name} is over 10 MB.`);
        continue;
      }
      const url = await put(file);
      if (url) urls.push(url);
    }
    setGalleryBusy(false);
    if (urls.length) onChange({ ...value, gallery: [...value.gallery, ...urls] });
  };

  const onVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("video/")) return toast.error("Please choose a video file.");
    if (file.size > MAX_VIDEO_BYTES) return toast.error("Video must be under 200 MB.");
    setVideoBusy(true);
    const url = await put(file);
    setVideoBusy(false);
    if (url) onChange({ ...value, video_url: url });
  };

  const removeGalleryItem = (url: string) =>
    onChange({ ...value, gallery: value.gallery.filter((g) => g !== url) });

  return (
    <div className="space-y-6">
      {/* Cover */}
      <div>
        <p className="text-sm font-medium text-ink-soft">Cover image</p>
        <div className="mt-2 flex items-center gap-4">
          <div className="relative h-24 w-40 overflow-hidden rounded-xl border border-line bg-primary-50">
            {value.cover_url ? (
              <Image src={value.cover_url} alt="Cover" fill className="object-cover" />
            ) : (
              <div className="grid h-full place-content-center text-xs text-ink-muted">No cover</div>
            )}
          </div>
          <div>
            <input ref={coverInput} type="file" accept="image/*" hidden onChange={onCover} />
            <button
              type="button"
              onClick={() => coverInput.current?.click()}
              disabled={coverBusy}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-line px-4 text-sm font-medium text-ink disabled:opacity-60"
            >
              {coverBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {value.cover_url ? "Replace cover" : "Upload cover"}
            </button>
            <p className="mt-1 text-xs text-ink-muted">JPG/PNG/WebP, up to 10 MB.</p>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div>
        <p className="text-sm font-medium text-ink-soft">
          Gallery ({value.gallery.length}/{MAX_GALLERY})
        </p>
        <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {value.gallery.map((url) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-line">
              <Image src={url} alt="Gallery" fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeGalleryItem(url)}
                className="absolute right-1 top-1 grid h-6 w-6 place-content-center rounded-full bg-ink/70 text-white"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {value.gallery.length < MAX_GALLERY && (
            <button
              type="button"
              onClick={() => galleryInput.current?.click()}
              disabled={galleryBusy}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line text-xs text-ink-muted hover:border-primary/40 disabled:opacity-60"
            >
              {galleryBusy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
              Add
            </button>
          )}
        </div>
        <input ref={galleryInput} type="file" accept="image/*" multiple hidden onChange={onGallery} />
      </div>

      {/* Video */}
      <div>
        <p className="text-sm font-medium text-ink-soft">Promo video (optional)</p>
        <div className="mt-2 flex items-center gap-4">
          <div className="grid h-24 w-40 place-content-center overflow-hidden rounded-xl border border-line bg-primary-50 text-primary">
            {value.video_url ? <Film className="h-6 w-6" /> : <span className="text-xs text-ink-muted">No video</span>}
          </div>
          <div>
            <input ref={videoInput} type="file" accept="video/*" hidden onChange={onVideo} />
            <button
              type="button"
              onClick={() => videoInput.current?.click()}
              disabled={videoBusy}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-line px-4 text-sm font-medium text-ink disabled:opacity-60"
            >
              {videoBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {value.video_url ? "Replace video" : "Upload video"}
            </button>
            {value.video_url && (
              <button
                type="button"
                onClick={() => onChange({ ...value, video_url: "" })}
                className="ml-2 text-xs text-invalid"
              >
                Remove
              </button>
            )}
            <p className="mt-1 text-xs text-ink-muted">MP4/WebM, up to 200 MB.</p>
          </div>
        </div>
      </div>
    </div>
  );
}