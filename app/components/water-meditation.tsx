"use client"

import { useState, useEffect } from "react"
import { ColorPicker } from "./color-picker"
import { Slider } from "@/components/ui/slider"
import { ImageUploader } from "./image-uploader"
import WaveRectangle from "./wave-animation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// 색상 옵션 배열 추가
const colorOptions = [
  { name: "회색", value: "#555555" },
  { name: "빨강", value: "#FF5555" },
  { name: "파랑", value: "#5555FF" },
  { name: "초록", value: "#55AA55" },
  { name: "보라", value: "#AA55AA" },
  { name: "노랑", value: "#FFAA00" },
]

export default function DemoPage() {
  const [rectWidth, setRectWidth] = useState(400)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedColor, setSelectedColor] = useState("#000000") // 기본 색상은 검정색
  const [lastSelectedColor, setLastSelectedColor] = useState("#000000") // 마지막으로 선택한 색상 저장
  const [stoneImage, setStoneImage] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"color" | "image">("color")

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

  // 탭 변경 처리
  const handleTabChange = (value: string) => {
    const newTab = value as "color" | "image"
    setActiveTab(newTab)

    // 색상 탭으로 이동할 때 마지막으로 선택한 색상 복원
    if (newTab === "color") {
      setSelectedColor(lastSelectedColor)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 bg-gradient-to-b from-sky-50 to-blue-100">
      <h1 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-6 sm:mb-8 text-center">
        Interactive Wave Animation
      </h1>

      <div className="mb-6 sm:mb-8">
        <WaveRectangle width={rectWidth} stoneColor={selectedColor} stoneImage={stoneImage} activeTab={activeTab} />
      </div>

      <div className="w-full max-w-md px-2 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rectangle Width: {rectWidth}px</label>
          <Slider
            value={[rectWidth]}
            min={200}
            max={isMobile ? window.innerWidth - 40 : 1440}
            step={10}
            onValueChange={(value) => setRectWidth(value[0])}
            className="mb-6 sm:mb-8"
          />
        </div>

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
