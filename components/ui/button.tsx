import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "tap-target relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent font-semibold transition-[background-color,border-color,color,transform,box-shadow] duration-200 active:scale-[.97] disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-pine text-pine-ink shadow-[inset_0_1px_0_rgba(255,255,255,.12),0_6px_16px_-8px_rgba(29,90,68,.6)] hover:bg-pine-hover",
        soft: "border-line bg-surface-2 text-ink hover:bg-surface-3",
        ghost: "bg-transparent text-ink-2 hover:bg-surface-2 hover:text-ink",
        destructive: "bg-berry text-berry-ink hover:opacity-90",
        link: "text-pine-text underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-[18px] text-[15px] [&_svg]:size-[18px]",
        sm: "h-[38px] px-3.5 text-sm [&_svg]:size-4",
        icon: "h-10 w-10 font-normal [&_svg]:size-[18px]",
      },
    },
    compoundVariants: [
      // Icon buttons are quieter than text buttons
      { size: "icon", variant: "ghost", className: "text-ink-2" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
