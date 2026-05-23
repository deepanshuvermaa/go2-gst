import { HTMLAttributes, forwardRef } from "react";

type Surface = "light" | "dark" | "darker";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  surface?: Surface;
  padding?: "sm" | "md" | "lg";
  interactive?: boolean;
}

const surfaces: Record<Surface, string> = {
  light: "bg-canvas-white border border-ink-black/[0.06]",
  dark: "bg-carbon-gray text-canvas-white",
  darker: "bg-steel-gray text-canvas-white",
};

const paddings = {
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ surface = "light", padding = "md", interactive, className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-[8px]
          ${surfaces[surface]}
          ${paddings[padding]}
          ${interactive ? "cursor-pointer transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99]" : ""}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
