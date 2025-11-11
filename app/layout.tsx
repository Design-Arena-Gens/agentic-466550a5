import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Personal Agent',
  description: 'Your intelligent voice-controlled personal assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
