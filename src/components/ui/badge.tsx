import { HTMLAttributes } from "react";

type BadgeVariant = "default" | "success" | "warning" | "error" | "primary" | "ai";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-[#eef2fb] text-[#4a5568]",
  success: "bg-[#22c55e]/10 text-[#22c55e]",
  warning: "bg-[#f59e0b]/10 text-[#f59e0b]",
  error: "bg-[#ef4444]/10 text-[#ef4444]",
  primary: "bg-[#d6e4ff] text-[#3b5bdb]",
  ai: "bg-gradient-to-r from-[#3b5bdb]/10 to-[#4c6ef5]/10 text-[#3b5bdb]",
};

export function Badge({ variant = "default", className = "", children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
