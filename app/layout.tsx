import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pixel Canvas for Change',
  description: 'Paint for the Planet - A collaborative pixel art platform for charity',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
        {children}
      </body>
    </html>
  )
}

