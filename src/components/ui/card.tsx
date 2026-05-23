import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "surface" | "active" | "ai";
  interactive?: boolean;
}

const variants = {
  default: "bg-[#fcfcfc] border border-[#e2e8f0]",
  surface: "bg-[#eef2fb] border border-[#d6e4ff]",
  active: "bg-[#d6e4ff] border border-[#3b5bdb]/20",
  ai: "bg-[#eef2fb] border border-[#d6e4ff]",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", interactive, className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={`
        rounded-[14px] p-5
        ${variants[variant]}
        ${interactive ? "cursor-pointer transition-all duration-200 hover:shadow-[0_4px_16px_rgba(26,26,46,0.06)] hover:border-[#94a3b8]" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
);

Card.displayName = "Card";
