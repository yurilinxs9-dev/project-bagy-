import React from 'react'
import { VideoShowcase } from '../components/VideoShowcase'
import { WidgetConfig } from '../types'

interface EmbedProps {
  config?: WidgetConfig
}

export function Embed({ config }: EmbedProps) {
  return <VideoShowcase config={config} />
}
