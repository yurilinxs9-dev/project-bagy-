import { VideoShowcase } from '@/components/VideoShowcase'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Video Commerce Widget
        </h1>
        <p className="text-center text-gray-500 mb-10">
          Demo — Carrossel de vídeos estilo stories para sua loja
        </p>
        <VideoShowcase />
      </div>
    </main>
  )
}
