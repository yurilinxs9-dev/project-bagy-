import { VideoShowcase } from '@/components/VideoShowcase'

export const metadata = {
  title: 'Widget',
}

export default function EmbedPage() {
  return (
    <>
      <style>{`
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: transparent !important;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
      <VideoShowcase />
    </>
  )
}
