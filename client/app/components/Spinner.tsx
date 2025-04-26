import { cn } from "@/lib/utils";

export const Spinner = ({
  size = "default",
  className,
}: {
  size?: "default" | "small" | "large";
  className?: string;
}) => (
  <div
    className={cn(
      "flex size-6 items-center justify-center rounded-full border-2 border-current/90",
      {
        "scale-[calc(48/24)]": size === "large", // 48px
        "scale-[calc(24/24)]": size === "default", // 24px
        "scale-[calc(16/24)]": size === "small", // 16px
      },
      className,
    )}
  >
    <div className="relative flex animate-spin duration-900">
      <div className="relative flex size-[14px] rotate-45 rounded-full border-[3px] border-transparent border-l-current" />
      <div className="absolute top-0 left-[7px] size-[3px] -translate-x-1/2 rounded-full bg-current" />
      <div className="absolute top-[7px] left-0 size-[3px] -translate-y-1/2 rounded-full bg-current" />
    </div>
  </div>
);
