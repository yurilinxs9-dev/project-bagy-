'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Store } from '@/types'

export default function AdminPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newStore, setNewStore] = useState({ name: '', slug: '', storeUrl: '' })
  const [creating, setCreating] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetch('/api/stores')
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) throw new Error(data?.error ?? `HTTP ${r.status}`)
        return data
      })
      .then((data) => {
        if (Array.isArray(data)) setStores(data)
      })
      .catch((err) => showToast(`Erro ao carregar lojas: ${err.message}`))
      .finally(() => setLoading(false))
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStore.name || !newStore.slug) {
      showToast('Nome e slug são obrigatórios')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStore),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erro ao criar loja')
      }
      const store: Store = await res.json()
      setStores((prev) => [...prev, store])
      setNewStore({ name: '', slug: '', storeUrl: '' })
      setShowForm(false)
      showToast('Loja criada!')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao criar loja')
    } finally {
      setCreating(false)
    }
  }

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        Carregando...
      </div>
    )
  }

  return (
    <>
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lojas</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {stores.length}{' '}
            {stores.length === 1 ? 'loja cadastrada' : 'lojas cadastradas'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Nova loja
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Nova loja</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text"
              placeholder="Nome da loja *"
              value={newStore.name}
              onChange={(e) =>
                setNewStore((s) => ({ ...s, name: e.target.value }))
              }
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Slug URL-friendly (ex: julia-gontijo) *"
              value={newStore.slug}
              onChange={(e) =>
                setNewStore((s) => ({
                  ...s,
                  slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                }))
              }
              className={inputClass}
            />
            <input
              type="url"
              placeholder="URL da loja (opcional)"
              value={newStore.storeUrl}
              onChange={(e) =>
                setNewStore((s) => ({ ...s, storeUrl: e.target.value }))
              }
              className={inputClass}
            />
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {creating ? 'Criando...' : 'Criar loja'}
              </button>
            </div>
          </form>
        </div>
      )}

      {stores.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <div className="text-5xl mb-4">🏪</div>
          <p className="text-gray-900 font-semibold mb-2">Nenhuma loja cadastrada</p>
          <p className="text-gray-500 text-sm mb-6">
            Crie a primeira loja para começar
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            + Nova loja
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {stores.map((store) => (
            <Link
              key={store.id}
              href={`/admin/stores/${store.slug}`}
              className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-400 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-black">
                    {store.name}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
                      {store.slug}
                    </code>
                    {store.storeUrl && (
                      <span className="truncate">{store.storeUrl}</span>
                    )}
                  </p>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400 flex-shrink-0"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
