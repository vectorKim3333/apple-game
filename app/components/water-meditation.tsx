"use client"

import { useState, useEffect, useRef } from "react"
import { ColorPicker } from "./color-picker"
import { Slider } from "@/components/ui/slider"
import { ImageUploader } from "./image-uploader"
import WaveRectangle from "./wave-animation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WAVE_CONSTANTS } from '../constants/wave-animation'

// 색상 옵션 배열 추가
const colorOptions = [
  { name: "회색", value: "#555555" },
  { name: "빨강", value: "#FF5555" },
  { name: "파랑", value: "#5555FF" },
  { name: "초록", value: "#55AA55" },
  { name: "보라", value: "#AA55AA" },
  { name: "노랑", value: "#FFAA00" },
]

const WAVE_LABELS: Record<string, string> = {
  MIN_STONE_SIZE: "최소 돌 크기(px)",
  MAX_STONE_SIZE: "최대 돌 크기(px)",
  DRAG_THRESHOLD: "드래그 전환 거리(픽셀)",
  STONE_CREATION_INTERVAL: "돌 생성 간격(ms)",
  STONE_GRAVITY: "돌이 떨어지는 속도",
  RIPPLE_STRENGTH: "물결 강도",
  WAVE_SPEED: "물결 이동 속도",
}

const STORAGE_KEY = 'watermeditation_settings'

export default function DemoPage() {
  const [rectWidth, setRectWidth] = useState(400)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedColor, setSelectedColor] = useState("#000000") // 기본 색상은 검정색
  const [lastSelectedColor, setLastSelectedColor] = useState("#000000") // 마지막으로 선택한 색상 저장
  const [stoneImage, setStoneImage] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"color" | "image">("color")
  const [waveConstants, setWaveConstants] = useState({
    MIN_STONE_SIZE: WAVE_CONSTANTS.MIN_STONE_SIZE,
    MAX_STONE_SIZE: WAVE_CONSTANTS.MAX_STONE_SIZE,
    DRAG_THRESHOLD: WAVE_CONSTANTS.DRAG_THRESHOLD,
    STONE_CREATION_INTERVAL: WAVE_CONSTANTS.STONE_CREATION_INTERVAL,
    STONE_GRAVITY: WAVE_CONSTANTS.STONE_GRAVITY,
    RIPPLE_STRENGTH: WAVE_CONSTANTS.RIPPLE_STRENGTH,
    WAVE_SPEED: WAVE_CONSTANTS.WAVE_SPEED,
  })

  // 디바운스 타이머 ref
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Adjust width for mobile devices
  useEffect(() => {
    if (isMobile) {
      setRectWidth(Math.min(rectWidth, window.innerWidth - 40))
    }
  }, [isMobile, rectWidth])

  // 이미지 URL이 변경될 때 정리
  useEffect(() => {
    // 이미지 URL이 변경될 때 이전 URL 정리
    return () => {
      if (stoneImage) {
        URL.revokeObjectURL(stoneImage)
      }
    }
  }, [stoneImage])

  // 색상이 변경될 때 마지막 선택 색상 업데이트
  useEffect(() => {
    if (activeTab === "color") {
      setLastSelectedColor(selectedColor)
    }
  }, [selectedColor, activeTab])

  // 마운트 시 로컬스토리지에서 불러오기
  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (typeof parsed.rectWidth === 'number') setRectWidth(parsed.rectWidth)
        if (typeof parsed.waveConstants === 'object' && parsed.waveConstants) {
          setWaveConstants((prev) => ({ ...prev, ...parsed.waveConstants }))
        }
      } catch {}
    }
  }, [])

  // rectWidth, waveConstants 변경 시 디바운스로 로컬스토리지 저장
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ rectWidth, waveConstants })
      )
    }, 300)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rectWidth, waveConstants])

  // 탭 변경 처리
  const handleTabChange = (value: string) => {
    const newTab = value as "color" | "image"
    setActiveTab(newTab)

    // 색상 탭으로 이동할 때 마지막으로 선택한 색상 복원
    if (newTab === "color") {
      setSelectedColor(lastSelectedColor)
    }
  }

  const handleWaveConstantChange = (key: keyof typeof waveConstants, value: number) => {
    setWaveConstants(prev => ({ ...prev, [key]: value }))
  }

  // 실제로 WaveRectangle에 전달할 전체 상수 객체 생성
  const mergedWaveConstants = {
    ...WAVE_CONSTANTS,
    ...waveConstants,
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 bg-gradient-to-b from-sky-50 to-blue-100">
      <h1 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-6 sm:mb-8 text-center">
        물멍
      </h1>

      <div className="mb-6 sm:mb-8">
        <WaveRectangle
          width={rectWidth}
          stoneColor={selectedColor}
          stoneImage={stoneImage}
          activeTab={activeTab}
          waveConstants={mergedWaveConstants}
        />
      </div>

      {/* Wave Animation 설정 아코디언 */}
      <details className="w-full max-w-md mb-4" open>
        <summary className="font-semibold text-blue-700 cursor-pointer py-2">Wave Animation 설정</summary>
        <div className="space-y-3 p-2 bg-white bg-opacity-80 rounded-md shadow">
          {/* Rectangle Width 슬라이더 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">가로 크기: {rectWidth}px</label>
            <div className="flex items-center gap-2">
              <Slider
                value={[rectWidth]}
                min={200}
                max={isMobile ? window.innerWidth - 40 : 1440}
                step={10}
                onValueChange={(value) => setRectWidth(value[0])}
                className="mb-2 flex-1"
              />
              <button
                type="button"
                className="ml-2 p-0 w-6 h-6 flex items-center justify-center bg-transparent border-none hover:text-blue-600"
                aria-label="가로 크기 초기화"
                onClick={() => setRectWidth(400)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12.1333 3.88611V2.93334C12.1333 2.54674 12.4467 2.23334 12.8333 2.23334C13.2199 2.23334 13.5333 2.54674 13.5333 2.93334V5.60001C13.5333 5.98661 13.2199 6.30001 12.8333 6.30001H10.2475C9.86088 6.30001 9.54748 5.98661 9.54748 5.60001C9.54748 5.21341 9.86088 4.90001 10.2475 4.90001H11.1619C10.3402 3.95461 9.15221 3.36667 7.83839 3.36667C5.38888 3.36667 3.36667 5.42063 3.36667 8.00001C3.36667 10.5794 5.38888 12.6333 7.83839 12.6333C9.80498 12.6333 11.4931 11.3132 12.0856 9.4541C12.203 9.08576 12.5968 8.88233 12.9651 8.99973C13.3335 9.11713 13.5369 9.5109 13.4195 9.87924C12.6547 12.2788 10.4555 14.0333 7.83839 14.0333C4.57538 14.0333 1.96667 11.3117 1.96667 8.00001C1.96667 4.68835 4.57538 1.96667 7.83839 1.96667C9.539 1.96667 11.0646 2.70874 12.1333 3.88611Z" fill="#222222"/>
                </svg>
              </button>
            </div>
          </div>
          {/* waveConstants 슬라이더 */}
          {Object.entries(waveConstants).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <label className="w-32 text-sm font-medium text-gray-700">{WAVE_LABELS[key] ?? key}</label>
              <input
                type="range"
                min={key === 'MIN_STONE_SIZE' ? 1 : key === 'MAX_STONE_SIZE' ? 5 : key === 'STONE_GRAVITY' ? 0.05 : key === 'RIPPLE_STRENGTH' ? 1 : key === 'WAVE_SPEED' ? 0.01 : 0}
                max={key === 'MIN_STONE_SIZE' ? 20 : key === 'MAX_STONE_SIZE' ? 50 : key === 'STONE_GRAVITY' ? 1 : key === 'RIPPLE_STRENGTH' ? 50 : key === 'WAVE_SPEED' ? 0.2 : 200}
                step={key === 'STONE_GRAVITY' || key === 'WAVE_SPEED' ? 0.01 : 1}
                value={value}
                onChange={e => handleWaveConstantChange(key as keyof typeof waveConstants, (key === 'STONE_GRAVITY' || key === 'WAVE_SPEED') ? Number(parseFloat(e.target.value)) : Number(e.target.value))}
                className="flex-1"
              />
              <span className="w-8 text-right">{value}</span>
              <button
                type="button"
                className="p-0 w-6 h-6 flex items-center justify-center bg-transparent border-none hover:text-blue-600"
                aria-label={`${WAVE_LABELS[key] ?? key} 초기화`}
                onClick={() => handleWaveConstantChange(key as keyof typeof waveConstants, WAVE_CONSTANTS[key as keyof typeof WAVE_CONSTANTS])}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12.1333 3.88611V2.93334C12.1333 2.54674 12.4467 2.23334 12.8333 2.23334C13.2199 2.23334 13.5333 2.54674 13.5333 2.93334V5.60001C13.5333 5.98661 13.2199 6.30001 12.8333 6.30001H10.2475C9.86088 6.30001 9.54748 5.98661 9.54748 5.60001C9.54748 5.21341 9.86088 4.90001 10.2475 4.90001H11.1619C10.3402 3.95461 9.15221 3.36667 7.83839 3.36667C5.38888 3.36667 3.36667 5.42063 3.36667 8.00001C3.36667 10.5794 5.38888 12.6333 7.83839 12.6333C9.80498 12.6333 11.4931 11.3132 12.0856 9.4541C12.203 9.08576 12.5968 8.88233 12.9651 8.99973C13.3335 9.11713 13.5369 9.5109 13.4195 9.87924C12.6547 12.2788 10.4555 14.0333 7.83839 14.0333C4.57538 14.0333 1.96667 11.3117 1.96667 8.00001C1.96667 4.68835 4.57538 1.96667 7.83839 1.96667C9.539 1.96667 11.0646 2.70874 12.1333 3.88611Z" fill="#222222"/>
                </svg>
              </button>
            </div>
          ))}
          <div className="flex justify-end">
          <button
            type="button"
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded shadow text-sm font-semibold border border-blue-200 transition"
            onClick={() => {
              setRectWidth(400)
              setWaveConstants({
                MIN_STONE_SIZE: WAVE_CONSTANTS.MIN_STONE_SIZE,
                MAX_STONE_SIZE: WAVE_CONSTANTS.MAX_STONE_SIZE,
                DRAG_THRESHOLD: WAVE_CONSTANTS.DRAG_THRESHOLD,
                STONE_CREATION_INTERVAL: WAVE_CONSTANTS.STONE_CREATION_INTERVAL,
                STONE_GRAVITY: WAVE_CONSTANTS.STONE_GRAVITY,
                RIPPLE_STRENGTH: WAVE_CONSTANTS.RIPPLE_STRENGTH,
                WAVE_SPEED: WAVE_CONSTANTS.WAVE_SPEED,
              })
            }}
          >
            전체 초기화
          </button>
        </div>
        </div>
      </details>

      <div className="w-full max-w-md px-2 space-y-4">
        <Tabs defaultValue="color" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="color">색상 선택</TabsTrigger>
            <TabsTrigger value="image">이미지 선택</TabsTrigger>
          </TabsList>
          <TabsContent value="color" className="pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">돌맹이 색상 선택</label>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2 justify-center">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`w-10 h-10 rounded-full border-2 ${
                        selectedColor === color.value ? "border-white ring-2 ring-blue-500" : "border-gray-200"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                      aria-label={`${color.name} 색상 선택`}
                    />
                  ))}
                </div>
                <ColorPicker value={selectedColor} onChange={setSelectedColor} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="image" className="pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">돌맹이 이미지 선택</label>
              <div className="flex flex-col items-center">
                <ImageUploader onImageSelect={setStoneImage} currentImage={stoneImage} />
                <p className="text-xs text-gray-500 mt-2">
                  이미지를 선택하면 돌맹이에 적용됩니다. 1:1 비율의 이미지가 가장 잘 보입니다.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="mt-4 sm:mt-6 text-center max-w-md text-gray-600 px-4">
        <p className="font-medium text-blue-700 mb-2">
          {isMobile ? "하늘 영역을 길게 눌러보세요" : "하늘 영역을 클릭하고 유지해보세요"}!
        </p>
        <p className="text-sm mb-2">
          오래 누를수록 돌의 크기가 커집니다. 큰 돌이 물에 떨어질수록 더 큰 파동이 생성됩니다.
        </p>
        <p className="text-sm mb-2">클릭한 채로 마우스를 움직이면 커진 크기의 돌맹이들이 흩뿌려집니다.</p>
        <p className="text-sm">색상이나 이미지를 선택하여 다양한 돌맹이를 만들어보세요!</p>
      </div>
    </div>
  )
}
