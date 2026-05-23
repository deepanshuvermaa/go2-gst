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
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-medium text-ink-black tracking-[-0.02em]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full bg-transparent
            border-b border-ink-black/20
            py-2.5 text-[15px] text-ink-black
            tracking-[-0.02em]
            placeholder:text-muted-stone
            focus:border-deep-space-violet focus:outline-none
            transition-colors duration-150
            disabled:opacity-40
            ${error ? "border-error" : ""}
            ${className}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && (
          <span id={`${inputId}-error`} className="text-[12px] text-error" role="alert">
            {error}
          </span>
        )}
        {hint && !error && (
          <span id={`${inputId}-hint`} className="text-[12px] text-muted-stone">
            {hint}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
