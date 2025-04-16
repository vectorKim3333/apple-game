"use client"

import { useState, useRef, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Paintbrush } from "lucide-react"

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  presetColors?: string[]
}

export function ColorPicker({ value, onChange, presetColors = [] }: ColorPickerProps) {
  const [color, setColor] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Default preset colors if none provided
  const defaultPresets = [
    "#000000",
    "#555555",
    "#888888",
    "#AAAAAA",
    "#FF0000",
    "#FF5555",
    "#FF8888",
    "#FFAAAA",
    "#00FF00",
    "#55FF55",
    "#88FF88",
    "#AAFFAA",
    "#0000FF",
    "#5555FF",
    "#8888FF",
    "#AAAAFF",
    "#FFFF00",
    "#FFAA00",
    "#FF00FF",
    "#AA00FF",
    "#00FFFF",
    "#00AAFF",
    "#FFFFFF",
  ]

  const colors = presetColors.length > 0 ? presetColors : defaultPresets

  useEffect(() => {
    setColor(value)
  }, [value])

  const handleColorChange = (newColor: string) => {
    setColor(newColor)
    onChange(newColor)
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 h-12 p-1 rounded border border-gray-200"
        title="직접 색상 선택"
      />
      <span className="text-sm text-gray-600">
        직접 색상을 선택할 수 있습니다
      </span>
    </div>
  )
}
