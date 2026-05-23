import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col">
        {label && (
          <label htmlFor={inputId} className="font-[var(--font-heading)] text-[13px] font-medium text-[#4a5568] mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            h-[44px] px-[14px] w-full
            bg-[#fcfcfc] border border-[#e2e8f0] rounded-[10px]
            text-[14px] font-normal text-[#1a1a2e]
            placeholder:text-[#94a3b8] placeholder:font-normal
            transition-all duration-200 ease-out
            hover:border-[#94a3b8]
            focus:border-[#3b5bdb] focus:border-2 focus:shadow-[0_0_0_4px_rgba(59,91,219,0.08)] focus:outline-none
            disabled:opacity-50
            ${error ? "border-[#ef4444] focus:border-[#ef4444] focus:shadow-[0_0_0_4px_rgba(239,68,68,0.08)]" : ""}
            ${className}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && <span id={`${inputId}-error`} className="text-[12px] text-[#ef4444] mt-1.5" role="alert">{error}</span>}
        {hint && !error && <span id={`${inputId}-hint`} className="text-[12px] text-[#94a3b8] mt-1.5">{hint}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
