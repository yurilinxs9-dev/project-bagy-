import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Video Commerce Widget',
  description: 'Widget de video commerce embeddable para lojas virtuais',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
