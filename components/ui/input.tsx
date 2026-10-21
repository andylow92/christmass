import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "w-full rounded-input border border-line bg-surface px-3.5 py-[11px] text-base leading-[1.4] text-ink transition-[border-color,box-shadow] duration-200 placeholder:text-ink-3 focus:border-pine focus:shadow-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
