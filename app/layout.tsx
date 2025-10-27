import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Agent Team - Multi-Agent Development System',
  description: 'Highly intelligent AI agent team for research, planning, and development',
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
