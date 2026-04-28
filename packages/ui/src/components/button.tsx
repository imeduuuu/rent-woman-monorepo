import * as React from "react";
import { cn } from "../lib/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps): JSX.Element {
  const base =
    "inline-flex items-center justify-center gap-2 font-body font-500 rounded-input border transition-colors duration-base ease-rw-out cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed";

  const sizes = {
    sm: "h-8 px-3 text-body-s",
    md: "h-10 px-5 text-body-m",
    lg: "h-12 px-7 text-body-l",
  };

  const variants = {
    primary:
      "bg-rw-pink border-rw-pink text-white hover:bg-rw-pink-light hover:border-rw-pink-light",
    secondary:
      "bg-transparent border-[rgba(255,255,255,0.15)] text-rw-white-75 hover:border-[rgba(255,255,255,0.35)] hover:text-white",
    ghost:
      "bg-transparent border-transparent text-rw-white-45 hover:text-white hover:border-transparent",
  };

  return (
    <button
      className={cn(base, sizes[size], variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
