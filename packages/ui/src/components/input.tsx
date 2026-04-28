import * as React from "react";
import { cn } from "../lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps): JSX.Element {
  return (
    <input
      className={cn(
        "w-full h-10 px-4 bg-rw-black-300 border border-[rgba(255,255,255,0.15)] rounded-input text-body-m text-white placeholder:text-rw-white-45 outline-none transition-colors duration-base ease-rw-out focus:border-rw-pink",
        className
      )}
      {...props}
    />
  );
}
