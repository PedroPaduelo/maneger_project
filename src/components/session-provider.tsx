"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </NextThemesProvider>
    </SessionProvider>
  )
}