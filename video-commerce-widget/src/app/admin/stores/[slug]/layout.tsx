import React from 'react'
import Link from 'next/link'

export default function StoreAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { slug: string }
}) {
  const { slug } = params

  return (
    <>
      {/* Breadcrumb + nav da loja */}
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-200 flex-wrap">
        <Link
          href="/admin"
          className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Lojas
        </Link>
        <span className="text-gray-300">/</span>
        <code className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">
          {slug}
        </code>

        <div className="ml-auto flex items-center gap-5">
          <Link
            href={`/admin/stores/${slug}`}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Vídeos
          </Link>
          <Link
            href={`/admin/stores/${slug}/settings`}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Configurações
          </Link>
          <a
            href={`/embed?store=${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Ver widget ↗
          </a>
        </div>
      </div>

      {children}
    </>
  )
}
