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

  const GameContent = isGameStarted ? (
    <AppleNumberGame existingAudio={audioRef.current || undefined} />
  ) : (
    <div className="relative w-full max-w-4xl p-6 rounded-3xl bg-green-500">
      <div className="bg-white/90 rounded-2xl p-8 relative overflow-hidden">
        {/* 체크무늬 배경 패턴 */}
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-20" />
        
        {/* 게임 제목 */}
        <div className="relative mb-12">
          <h1 className="text-center">
            <span className="text-5xl font-bold" style={{ 
              background: 'linear-gradient(45deg, #FF6B6B 30%, #4CD964 70%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              사과 게임
            </span>
          </h1>
          <p className="text-lg text-gray-600 text-center mt-4">숫자를 맞추면서 사과를 모아보세요!</p>
        </div>

        {/* 시작 버튼 (사과 모양 SVG) */}
        <div className="flex justify-center">
          <button
            onClick={handleStart}
            className="transform transition-all duration-200 hover:scale-110 focus:outline-none relative group"
          >
            <div className="w-40 h-40">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                {/* 메인 사과 바디 */}
                <path
                  d="M12,3.8c-2.1,0-4.3,0.4-5.7,2.5C4.5,7.2,4,8.9,4,10.5c0,1.6,0.4,3.3,1.2,4.7c1.1,2,2.8,3.4,4.8,4c0.6,0.2,1.3,0.3,2,0.3c0.7,0,1.4-0.1,2-0.3c2-0.6,3.7-2,4.8-4c0.8-1.4,1.2-3.1,1.2-4.7c0-1.6-0.5-3.3-2.3-4.2C16.3,4.2,14.1,3.8,12,3.8z"
                  className="fill-red-500 group-hover:fill-red-600 transition-colors"
                />
                {/* 잎사귀 */}
                <path
                  d="M12,2c-0.6,0-1,0.4-1,1c0,0.3,0.1,0.6,0.3,0.8c0.2,0.2,0.4,0.3,0.7,0.3c0.3,0,0.5-0.1,0.7-0.3c0.2-0.2,0.3-0.5,0.3-0.8c0-0.6-0.4-1-1-1z"
                  className="fill-green-500 group-hover:fill-green-600 transition-colors"
                />
                {/* 줄기 */}
                <path
                  d="M12,3.5c0,0-0.6,0.4-0.6,1.3c0,0.9,0.6,1.7,0.6,1.7s0.6-0.8,0.6-1.7C12.6,3.9,12,3.5,12,3.5z"
                  className="fill-green-500 group-hover:fill-green-600 transition-colors"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-white group-hover:scale-105 transition-transform drop-shadow-lg">
                시작
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white flex justify-center items-center">
      {/* 왼쪽 광고 */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 w-[160px] h-[600px]">
        <GoogleAdsense
          client="ca-pub-XXXXXXXXXXXXXXXX"
          slot="XXXXXXXXXX"
          format="auto"
          responsive="false"
          style={{ width: '160px', height: '600px' }}
        />
      </div>

      {/* 게임 영역 */}
      <div className="mx-[180px]">
        {GameContent}
      </div>

      {/* 오른쪽 광고 */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 w-[160px] h-[600px]">
        <GoogleAdsense
          client="ca-pub-XXXXXXXXXXXXXXXX"
          slot="XXXXXXXXXX"
          format="auto"
          responsive="false"
          style={{ width: '160px', height: '600px' }}
        />
      </div>
    </div>
  )
}