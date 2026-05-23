import { HTMLAttributes } from "react";

type BadgeVariant = "default" | "success" | "warning" | "error" | "violet";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-ink-black/[0.06] text-ink-black",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
  violet: "bg-violet-muted text-deep-space-violet",
};

export function Badge({ variant = "default", className = "", children, ...props }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-2.5 py-1 rounded-[100px]
        text-[12px] font-medium tracking-[-0.02em]
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}
