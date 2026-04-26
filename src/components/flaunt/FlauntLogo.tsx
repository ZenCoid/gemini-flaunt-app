import { cn } from "../../lib/utils";

interface FlauntLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "mark" | "full";
}

export function FlauntLogo({ size = "md", variant = "mark" }: FlauntLogoProps) {
  if (variant === "full") {
    const h = size === "lg" ? "h-16 md:h-20" : size === "sm" ? "h-9" : "h-12";
    return (
      <img
        src="/flaunt-logo.jpg"
        alt="flaunt.fit"
        className={cn(h, "w-auto select-none glow-mark")}
      />
    );
  }

  const wrap =
    size === "lg"
      ? "h-14 w-14 md:h-16 md:w-16"
      : size === "sm"
        ? "h-9 w-9"
        : "h-11 w-11";
  const text =
    size === "lg" ? "text-3xl md:text-4xl" : size === "sm" ? "text-lg" : "text-2xl";

  return (
    <div className="inline-flex items-center gap-3">
      <div className={cn("relative rounded-2xl overflow-hidden border border-white/10 shadow-soft", wrap)}>
        <img 
          src="/flaunt-logo.jpg" 
          alt="" 
          className="h-full w-full object-cover" 
        />
      </div>
      <span className={cn("font-display italic font-bold tracking-tight leading-none", text)}>
        flaunt<span className="text-gradient-brand">.fit</span>
      </span>
    </div>
  );
}
