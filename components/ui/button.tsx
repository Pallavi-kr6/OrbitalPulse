import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "glass";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 cursor-pointer",
          {
            "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-indigo-500/25 hover:brightness-110":
              variant === "default",
            "bg-red-600 text-white hover:bg-red-700": variant === "destructive",
            "border border-white/20 bg-transparent hover:bg-white/10 text-white backdrop-blur-sm":
              variant === "outline",
            "bg-zinc-800 text-zinc-100 hover:bg-zinc-700": variant === "secondary",
            "hover:bg-zinc-800/50 text-zinc-200": variant === "ghost",
            "text-indigo-400 underline-offset-4 hover:underline": variant === "link",
            "bg-white/10 backdrop-blur-md border border-white/10 text-white shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:bg-white/20":
              variant === "glass",
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8 text-base": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
