'use client'

import { useEffect } from 'react'

interface GoogleAdsenseProps {
  style?: React.CSSProperties
  className?: string
  client: string
  slot: string
  format?: string
  responsive?: string
}

export default function GoogleAdsense({
  style,
  className,
  client,
  slot,
  format = 'auto',
  responsive = 'true',
}: GoogleAdsenseProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (err) {
      console.error('AdSense error:', err)
    }
  }, [])

  return (
    <ins
      className={`adsbygoogle ${className || ''}`}
      style={style || { display: 'block' }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive}
    />
  )
} 