import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LessonBell - Sprava lekci pro ucitele',
  description: 'Aplikace pro spravu lekci, zaku a rozvrhu',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <body className="font-sans antialiased">
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}
