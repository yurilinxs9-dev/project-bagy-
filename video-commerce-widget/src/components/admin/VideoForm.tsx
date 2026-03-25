'use client'

import React, { useState, useRef } from 'react'
import { VideoItem } from '@/types'

interface VideoFormProps {
  initialData?: VideoItem
  onSubmit: (data: VideoItem) => Promise<void>
  isLoading?: boolean
}

const emptyForm: Omit<VideoItem, 'id'> = {
  videoUrl: '',
  posterUrl: '',
  product: { name: '', price: '', image: '', url: '' },
  whatsapp: '',
}

const cloudinaryConfigured =
  typeof process !== 'undefined' &&
  !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

export function VideoForm({ initialData, onSubmit, isLoading }: VideoFormProps) {
  const [form, setForm] = useState<Omit<VideoItem, 'id'>>(
    initialData
      ? {
          videoUrl: initialData.videoUrl,
          posterUrl: initialData.posterUrl,
          product: { ...initialData.product },
          whatsapp: initialData.whatsapp ?? '',
        }
      : emptyForm
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isScraping, setIsScraping] = useState(false)
  const [scrapeError, setScrapeError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadProgress, setUploadProgress] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = (field: string, value: string) => {
    if (field.startsWith('product.')) {
      const key = field.replace('product.', '') as keyof VideoItem['product']
      setForm((f) => ({ ...f, product: { ...f.product, [key]: value } }))
    } else {
      setForm((f) => ({ ...f, [field]: value }))
    }
    setErrors((e) => ({ ...e, [field]: '' }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.videoUrl) e.videoUrl = 'Obrigatório'
    if (!form.product.name) e['product.name'] = 'Obrigatório'
    if (!form.product.price) e['product.price'] = 'Obrigatório'
    if (!form.product.url) e['product.url'] = 'Obrigatório'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    const id = initialData?.id ?? `video-${Date.now()}`
    await onSubmit({ id, ...form, whatsapp: form.whatsapp || undefined })
  }

  // ── Buscar dados do produto automaticamente ──────────────────────────────────
  const handleScrapeProduct = async () => {
    if (!form.product.url) {
      setScrapeError('Preencha a URL do produto primeiro')
      return
    }
    setIsScraping(true)
    setScrapeError('')
    try {
      const res = await fetch('/api/scrape-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: form.product.url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao buscar dados')
      if (data.name) set('product.name', data.name)
      if (data.price) set('product.price', data.price)
      if (data.image) set('product.image', data.image)
    } catch (err) {
      setScrapeError(err instanceof Error ? err.message : 'Erro ao buscar dados do produto')
    } finally {
      setIsScraping(false)
    }
  }

  // ── Upload de vídeo direto para Cloudinary (sem passar pelo servidor) ────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError('')
    setUploadProgress(`Enviando ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)...`)

    try {
      // Obter assinatura do servidor (request pequeno)
      const signRes = await fetch('/api/cloudinary/sign', { method: 'POST' })
      if (!signRes.ok) throw new Error('Erro ao obter assinatura de upload')
      const signData = await signRes.json()

      // Upload direto ao Cloudinary — bypassa limite de body do servidor
      const fd = new FormData()
      fd.append('file', file)
      fd.append('api_key', signData.api_key)
      fd.append('timestamp', String(signData.timestamp))
      fd.append('signature', signData.signature)
      fd.append('folder', signData.folder)
      fd.append('use_filename', signData.use_filename)
      fd.append('unique_filename', signData.unique_filename)

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signData.cloud_name}/video/upload`,
        { method: 'POST', body: fd }
      )
      const data = await uploadRes.json()

      if (!uploadRes.ok) throw new Error(data.error?.message || 'Erro no upload')
      set('videoUrl', data.secure_url)
      setUploadProgress('✅ Upload concluído!')
      setTimeout(() => setUploadProgress(''), 3000)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Erro no upload')
      setUploadProgress('')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const inputClass = (field: string) =>
    `w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[field] ? 'border-red-400' : 'border-gray-300'
    }`

  const getValue = (field: string): string => {
    if (field.startsWith('product.')) {
      const key = field.replace('product.', '') as keyof VideoItem['product']
      return form.product[key]
    }
    return (form as unknown as Record<string, string>)[field] ?? ''
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── URL do Vídeo ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL do Vídeo MP4 *
        </label>
        <input
          type="text"
          value={form.videoUrl}
          onChange={(e) => set('videoUrl', e.target.value)}
          placeholder="https://res.cloudinary.com/seu-cloud/video/upload/v1/video.mp4"
          className={inputClass('videoUrl')}
        />
        {errors.videoUrl && <p className="text-xs text-red-500 mt-1">{errors.videoUrl}</p>}

        {/* Upload para Cloudinary */}
        {cloudinaryConfigured ? (
          <div className="mt-2 flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
              id="video-file-input"
            />
            <label
              htmlFor="video-file-input"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border cursor-pointer transition-colors ${
                isUploading
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {isUploading ? (
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              )}
              {isUploading ? 'Enviando...' : 'Upload para Cloudinary'}
            </label>
            {uploadProgress && <span className="text-xs text-gray-500">{uploadProgress}</span>}
          </div>
        ) : (
          <p className="text-xs text-gray-400 mt-1">URL direta do arquivo .mp4 (Cloudinary, etc.)</p>
        )}
        {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
      </div>

      {/* ── Poster ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL do Poster (capa)
        </label>
        <input
          type="text"
          value={form.posterUrl}
          onChange={(e) => set('posterUrl', e.target.value)}
          placeholder="https://res.cloudinary.com/seu-cloud/image/upload/v1/poster.jpg"
          className={inputClass('posterUrl')}
        />
        <p className="text-xs text-gray-400 mt-1">Imagem exibida antes do vídeo carregar</p>
        {form.posterUrl && (
          <img
            src={form.posterUrl}
            alt="Preview"
            className="mt-2 w-16 h-24 object-cover rounded-lg border border-gray-200"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        )}
      </div>

      {/* ── URL do Produto + Botão Scrape ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL da Página do Produto *
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={form.product.url}
            onChange={(e) => set('product.url', e.target.value)}
            placeholder="https://sua-loja.com/produto"
            className={inputClass('product.url') + ' flex-1'}
          />
          <button
            type="button"
            onClick={handleScrapeProduct}
            disabled={isScraping || !form.product.url}
            className="px-3 py-2 text-xs bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            {isScraping ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                </svg>
                Buscando...
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Buscar dados
              </>
            )}
          </button>
        </div>
        {errors['product.url'] && <p className="text-xs text-red-500 mt-1">{errors['product.url']}</p>}
        {scrapeError && <p className="text-xs text-red-500 mt-1">{scrapeError}</p>}
      </div>

      {/* ── Nome ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto *</label>
        <input
          type="text"
          value={getValue('product.name')}
          onChange={(e) => set('product.name', e.target.value)}
          placeholder="Camisa Transpasse Cintos"
          className={inputClass('product.name')}
        />
        {errors['product.name'] && <p className="text-xs text-red-500 mt-1">{errors['product.name']}</p>}
      </div>

      {/* ── Preço ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Preço *</label>
        <input
          type="text"
          value={getValue('product.price')}
          onChange={(e) => set('product.price', e.target.value)}
          placeholder="R$ 299,99"
          className={inputClass('product.price')}
        />
        {errors['product.price'] && <p className="text-xs text-red-500 mt-1">{errors['product.price']}</p>}
      </div>

      {/* ── Imagem do Produto ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL da Imagem do Produto
        </label>
        <input
          type="text"
          value={getValue('product.image')}
          onChange={(e) => set('product.image', e.target.value)}
          placeholder="https://cdn.dooca.store/... (preenchido automaticamente)"
          className={inputClass('product.image')}
        />
        <p className="text-xs text-gray-400 mt-1">Preenchido automaticamente ao clicar em &quot;Buscar dados&quot;</p>
        {form.product.image && (
          <img
            src={form.product.image}
            alt="Preview produto"
            className="mt-2 w-12 h-12 object-cover rounded-lg border border-gray-200"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        )}
      </div>

      {/* ── WhatsApp ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (opcional)</label>
        <input
          type="text"
          value={getValue('whatsapp')}
          onChange={(e) => set('whatsapp', e.target.value)}
          placeholder="5537999999999"
          className={inputClass('whatsapp')}
        />
        <p className="text-xs text-gray-400 mt-1">Com DDI. Vazio = usa o número padrão das configurações</p>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => history.back()}
          className="px-5 py-2.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading || isUploading}
          className="px-5 py-2.5 text-sm bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Salvando...' : 'Salvar vídeo'}
        </button>
      </div>
    </form>
  )
}
