import "./globals.css"

import type { Metadata, Viewport } from "next"
import RegisterServiceWorker from "./register-sw"
import { Toaster } from "@/components/ui/toaster"
import { ConvexClientProvider } from "@/components/convex-client-provider"

export const metadata: Metadata = {
  title: "Rozvrh hodin - Časovač pro výuku",
  description: "Aplikace pro správu rozvrhu hodin s časovačem a upozorněními",
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  themeColor: "#2563eb",
}

export const dynamic = "force-dynamic"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <body className="font-sans antialiased">
        <RegisterServiceWorker />
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
        <Toaster />
      </body>
    </html>
  )
}
