import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "min-h-[84px] w-full resize-y rounded-input border border-line bg-surface px-3.5 py-[11px] text-base leading-[1.4] text-ink transition-[border-color,box-shadow] duration-200 placeholder:text-ink-3 focus:border-pine focus:shadow-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
