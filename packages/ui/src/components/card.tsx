import * as React from "react";
import { cn } from "../lib/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, children, ...props }: CardProps): JSX.Element {
  return (
    <div
      className={cn(
        "bg-rw-black-100 border border-[rgba(255,255,255,0.15)] rounded-card p-6 transition-colors duration-base ease-rw-out hover:bg-rw-black-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>): JSX.Element {
  return (
    <h3
      className={cn("font-body font-medium text-body-m text-white", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>): JSX.Element {
  return (
    <p
      className={cn("text-body-s text-rw-white-45 leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  );
}
