import React from 'react'
import Link from 'next/link'
import { LogoutButton } from '@/components/admin/LogoutButton'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl">🎬</span>
            <span className="text-lg font-bold text-gray-900">Video Commerce Admin</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Vídeos
            </Link>
            <Link href="/admin/settings" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Configurações
            </Link>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Ver widget ↗
            </a>
            <LogoutButton />
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
