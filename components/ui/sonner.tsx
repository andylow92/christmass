"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="top-center"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg",
          description: "group-[.toast]:text-muted-foreground",
          // Sonner's own button styles win without !important
          actionButton:
            "!bg-primary !text-primary-foreground !rounded-full !px-3 !font-medium",
          cancelButton: "!bg-muted !text-muted-foreground !rounded-full",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
