"use client"

import { useState, useRef, useEffect } from 'react'
import AppleNumberGame from '@/apple-number-game'
import GoogleAdsense from '@/components/GoogleAdsense'

export default function Home() {
  const [isGameStarted, setIsGameStarted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Initialize audio
    const audio = new Audio()
    audio.src = '/sounds/bgm.mp3'
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = 0.5 // 50% volume
    audioRef.current = audio

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const handleStart = async () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/bgm.mp3')
      audioRef.current.loop = true
      audioRef.current.volume = 0.5
    }

    try {
      await audioRef.current.play()
    } catch (error) {
      console.error('BGM 재생 실패:', error)
    }
    setIsGameStarted(true)
  }

  return (
    <div className="min-h-screen bg-white flex justify-center items-center">
      {/* 왼쪽 광고 */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 w-[160px] h-[600px]">
        <GoogleAdsense
          client="ca-pub-1563226922053554"
          slot="XXXXXXXXXX"
          format="auto"
          responsive="false"
          style={{ width: '160px', height: '600px' }}
        />
      </div>

      {/* 게임 영역 */}
      <div className="mx-[180px]">
        <AppleNumberGame existingAudio={audioRef.current || undefined} />
      </div>

      {/* 오른쪽 광고 */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 w-[160px] h-[600px]">
        <GoogleAdsense
          client="ca-pub-1563226922053554"
          slot="XXXXXXXXXX"
          format="auto"
          responsive="false"
          style={{ width: '160px', height: '600px' }}
        />
      </div>
    </div>
  )
}