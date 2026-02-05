import "./globals.css"

import type { Metadata } from "next"
import RegisterServiceWorker from "./register-sw"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Rozvrh hodin - Časovač pro výuku",
  description: "Aplikace pro správu rozvrhu hodin s časovačem a upozorněními",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <body className="font-sans antialiased">
        <RegisterServiceWorker />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
