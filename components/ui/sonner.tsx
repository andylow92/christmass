"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

// Ink pill with an icon tile; bottom-right on desktop, full-width bottom on phones
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="bottom-right"
      duration={3000}
      offset={24}
      mobileOffset={{ bottom: 24, left: 16, right: 16 }}
      style={{ "--width": "420px" } as React.CSSProperties}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full items-center gap-3 rounded-2xl bg-ink py-3 pl-3 pr-3.5 text-sm text-bg shadow-lg",
          icon: "grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[10px] bg-[color-mix(in_srgb,var(--bg)_14%,transparent)] [&_svg]:size-4",
          content: "min-w-0 flex-1",
          title: "font-normal leading-snug [&_b]:font-semibold",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
