import * as React from "react";
import { cn } from "../lib/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "vip" | "ghost" | "online";
}

export function Badge({ variant = "default", className, children, ...props }: BadgeProps): JSX.Element {
  const variants = {
    default:
      "bg-rw-pink-soft text-rw-pink border border-rw-pink-border",
    vip:
      "bg-rw-pink-soft text-rw-pink border border-rw-pink-border",
    ghost:
      "bg-transparent text-rw-white-45 border border-[rgba(255,255,255,0.15)]",
    online:
      "bg-[rgba(0,229,160,0.12)] text-rw-online border border-[rgba(0,229,160,0.25)]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-2.5 py-1 text-body-xs font-medium tracking-[0.02em]",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
