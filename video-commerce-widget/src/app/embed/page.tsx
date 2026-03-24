import { VideoShowcase } from '@/components/VideoShowcase'

export const dynamic = 'force-dynamic'

export default function EmbedPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const storeSlug =
    typeof searchParams.store === 'string' ? searchParams.store : undefined

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
      <VideoShowcase storeSlug={storeSlug} />
    </>
  )
}
