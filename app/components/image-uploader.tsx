"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"

interface ImageUploaderProps {
  onImageSelect: (imageUrl: string) => void
  currentImage: string
}

export function ImageUploader({ onImageSelect, currentImage }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // currentImage가 변경되면 previewUrl 업데이트
  useEffect(() => {
    if (currentImage) {
      setPreviewUrl(currentImage)
    }
  }, [currentImage])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      onImageSelect(imageUrl)
    }
  }

  const handleClearImage = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onImageSelect("")
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
        {currentImage ? (
          <img
            src={currentImage}
            alt="Selected stone"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        id="image-upload"
      />
      <label
        htmlFor="image-upload"
        className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
      >
        이미지 선택
      </label>
    </div>
  )
}
