import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "primary" | "accent" | "valid" | "invalid";
}) {
  const tones = {
    neutral: "bg-line/60 text-ink-soft",
    primary: "bg-primary-50 text-primary",
    accent: "bg-accent-soft text-accent",
    valid: "bg-valid/10 text-valid",
    invalid: "bg-invalid/10 text-invalid",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}