import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "ai";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const base = "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 ease-out cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]";

const variants: Record<Variant, string> = {
  primary: "bg-[#3b5bdb] text-white rounded-[12px] hover:bg-[#4c6ef5] shadow-[0_1px_3px_rgba(26,26,46,0.04)]",
  secondary: "bg-[#eef2fb] text-[#3b5bdb] rounded-[12px] hover:bg-[#d6e4ff] border border-[#d6e4ff]",
  ghost: "bg-transparent text-[#4a5568] rounded-[10px] hover:bg-[#eef2fb] hover:text-[#1a1a2e]",
  ai: "bg-gradient-to-br from-[#3b5bdb] to-[#4c6ef5] text-white rounded-[10px] hover:brightness-[1.03]",
};

const sizes: Record<Size, string> = {
  sm: "h-[34px] px-3.5 text-[12px]",
  md: "h-[40px] px-5 text-[13px]",
  lg: "h-[48px] px-[22px] text-[14px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className = "", children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
);

Button.displayName = "Button";
