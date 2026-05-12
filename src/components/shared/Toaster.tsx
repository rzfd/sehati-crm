"use client"

import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      closeButton
      richColors
      theme="system"
      toastOptions={{
        classNames: {
          toast:       "!rounded-xl !border !shadow-md",
          title:       "!font-medium",
          description: "!text-xs",
        },
      }}
    />
  )
}
