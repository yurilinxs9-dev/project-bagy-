export interface VideoItem {
  id: string
  videoUrl: string
  posterUrl: string
  product: {
    name: string
    price: string
    image: string
    url: string
  }
  whatsapp?: string
}

export interface WidgetSettings {
  whatsappDefault: string
  accentColor: string
  autoplay: boolean
  autoplayDelay: number
  showArrows: boolean
  showDots: boolean
  showWhatsapp: boolean
  showShare: boolean
  showLike: boolean
  addToCartMode: 'redirect'
  storeUrl: string
}

export interface WidgetConfig {
  videos: VideoItem[]
  settings: WidgetSettings
}
