import Image from "next/image";
import { cn } from "@/lib/utils";

interface LearnHubLogoMarkProps {
  className?: string;
  variant?: "tile" | "plain" | "white";
}

interface LearnHubBrandProps {
  className?: string;
  markClassName?: string;
  markVariant?: LearnHubLogoMarkProps["variant"];
  textClassName?: string;
  learnClassName?: string;
  hubClassName?: string;
}

export function LearnHubLogoMark({ className, variant = "tile" }: LearnHubLogoMarkProps) {
  const isTile = variant === "tile";
  const imageSrc =
    variant === "white"
      ? "/images/learnhub-logo-mark-white.png"
      : isTile
        ? "/images/learnhub-logo-mark.png"
        : "/images/learnhub-logo-mark-transparent.png";
  const imageSizes = variant === "white" ? "96px" : isTile ? "48px" : "56px";

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative shrink-0 overflow-hidden",
        isTile && "rounded-xl bg-white shadow-sm ring-1 ring-black/10",
        className,
      )}
    >
      <Image
        src={imageSrc}
        alt=""
        fill
        sizes={imageSizes}
        className={cn("object-contain", variant === "white" && "object-top", isTile && "p-1")}
      />
    </span>
  );
}

export function LearnHubBrand({
  className,
  markClassName,
  markVariant,
  textClassName,
  learnClassName,
  hubClassName,
}: LearnHubBrandProps) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <LearnHubLogoMark className={cn("h-10 w-10", markClassName)} variant={markVariant} />
      <span className={cn("text-2xl font-extrabold tracking-tight", textClassName)}>
        <span className={cn("text-white", learnClassName)}>Learn</span>
        <span className={cn("text-brand-red", hubClassName)}>Hub</span>
      </span>
    </span>
  );
}
