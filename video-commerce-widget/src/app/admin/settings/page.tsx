'use client'

import React, { useEffect, useState } from 'react'
import { WidgetSettings } from '@/types'

const defaultSettings: WidgetSettings = {
  whatsappDefault: '',
  accentColor: '#c8344d',
  autoplay: true,
  autoplayDelay: 8000,
  showArrows: true,
  showDots: true,
  showWhatsapp: true,
  showShare: true,
  showLike: true,
  addToCartMode: 'redirect',
  storeUrl: '',
}

function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
          value ? 'bg-gray-900' : 'bg-gray-200'
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </label>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<WidgetSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then(setSettings)
      .finally(() => setLoading(false))
  }, [])

  const set = <K extends keyof WidgetSettings>(key: K, value: WidgetSettings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }))
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error()
      showToast('Configurações salvas!')
    } catch {
      showToast('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-gray-400 py-12 text-center">Carregando...</div>
  }

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <>
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm shadow-lg">
          {toast}
        </div>
      )}

      <div className="max-w-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-500 text-sm mt-1">Personalize o comportamento do widget</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Visual */}
          <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h2 className="font-semibold text-gray-900">Visual</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor de destaque
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => set('accentColor', e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer border-0 p-0.5 bg-transparent"
                />
                <span className="font-mono text-sm text-gray-600">{settings.accentColor}</span>
                <div
                  className="w-6 h-6 rounded-full border border-gray-200"
                  style={{ background: settings.accentColor }}
                />
              </div>
            </div>
          </section>

          {/* Contato */}
          <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h2 className="font-semibold text-gray-900">Contato</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp padrão
              </label>
              <input
                type="tel"
                value={settings.whatsappDefault}
                onChange={(e) => set('whatsappDefault', e.target.value)}
                placeholder="5537999999999"
                className={inputClass}
              />
              <p className="text-xs text-gray-400 mt-1">Com DDI, sem espaços ou hifens</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL da loja
              </label>
              <input
                type="url"
                value={settings.storeUrl}
                onChange={(e) => set('storeUrl', e.target.value)}
                placeholder="https://sua-loja.com"
                className={inputClass}
              />
            </div>
          </section>

          {/* Autoplay */}
          <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h2 className="font-semibold text-gray-900">Autoplay</h2>

            <Toggle
              label="Autoplay ativado"
              value={settings.autoplay}
              onChange={(v) => set('autoplay', v)}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delay entre slides (ms)
              </label>
              <input
                type="number"
                value={settings.autoplayDelay}
                onChange={(e) => set('autoplayDelay', Number(e.target.value))}
                min={3000}
                max={30000}
                step={1000}
                className={inputClass}
              />
            </div>
          </section>

          {/* Funcionalidades */}
          <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Funcionalidades</h2>

            <Toggle label="Setas de navegação" value={settings.showArrows} onChange={(v) => set('showArrows', v)} />
            <Toggle label="Paginação (dots)" value={settings.showDots} onChange={(v) => set('showDots', v)} />
            <Toggle label="Botão Curtir" value={settings.showLike} onChange={(v) => set('showLike', v)} />
            <Toggle label="Botão WhatsApp" value={settings.showWhatsapp} onChange={(v) => set('showWhatsapp', v)} />
            <Toggle label="Botão Compartilhar" value={settings.showShare} onChange={(v) => set('showShare', v)} />
          </section>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar configurações'}
          </button>
        </form>
      </div>
    </>
  )
}
