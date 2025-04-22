"use client"

import { useState, useRef, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { MoonIcon, SunIcon, ChevronDown, ChevronUp, ChevronRight, ChevronLeft } from "lucide-react"

interface Particle {
  x: number
  y: number
  size: number
  baseSize: number // 기본 크기 (변화의 기준점)
  sizeVariation: number // 크기 변화 범위
  sizeSpeed: number // 크기 변화 속도
  sizeOffset: number // 크기 변화 위상 차이 (각 입자마다 다른 타이밍으로 변화)
  speedX: number
  speedY: number
  targetX: number
  targetY: number
  life: number // 입자의 수명 (1.0 ~ 0.0)
  maxLife: number // 최대 수명 (프레임 수)
}

interface ParticleSettings {
  baseSize: number
  sizeVariation: number
  sizeSpeed: number
  maxLife: number
  speed: number
  particleCount: number
  emitCount: number
  emitInterval: number
}

const defaultSettings: ParticleSettings = {
  baseSize: 2,
  sizeVariation: 1,
  sizeSpeed: 0.02,
  maxLife: 300,
  speed: 1,
  particleCount: 200,
  emitCount: 3,
  emitInterval: 30,
}

export default function ParticleInteraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isFollowing, setIsFollowing] = useState(true)
  const [isActive, setIsActive] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)
  const [settings, setSettings] = useState<ParticleSettings>(defaultSettings)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const animationRef = useRef<number>(0)
  const isDraggingRef = useRef(false)
  const isMouseDownRef = useRef(false) // 마우스 버튼이 눌려있는지 추적
  const lastEmitTimeRef = useRef(0)
  const emitIntervalRef = useRef<NodeJS.Timeout | null>(null) // 입자 생성 인터벌
  const timeRef = useRef(0) // 전체 시간 추적용

  // Initialize particles
  useEffect(() => {
    const initParticles = () => {
      if (!canvasRef.current) return

      const canvas = canvasRef.current
      const width = window.innerWidth
      const height = window.innerHeight

      // 캔버스 크기 설정
      canvas.width = width
      canvas.height = height

      const particles: Particle[] = []

      for (let i = 0; i < settings.particleCount; i++) {
        const baseSize = Math.random() * settings.baseSize + 1
        const maxLife = Math.random() * settings.maxLife + 200
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: baseSize,
          baseSize: baseSize,
          sizeVariation: Math.random() * settings.sizeVariation + 0.5,
          sizeSpeed: Math.random() * settings.sizeSpeed + 0.01,
          sizeOffset: Math.random() * Math.PI * 2,
          speedX: (Math.random() - 0.5) * settings.speed,
          speedY: (Math.random() - 0.5) * settings.speed,
          targetX: Math.random() * width,
          targetY: Math.random() * height,
          life: maxLife,
          maxLife: maxLife,
        })
      }

      particlesRef.current = particles
    }

    initParticles()

    const handleResize = () => {
      if (!canvasRef.current) return

      canvasRef.current.width = window.innerWidth
      canvasRef.current.height = window.innerHeight
      initParticles()
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [settings.particleCount, settings.baseSize, settings.sizeVariation, settings.sizeSpeed, settings.speed])

  // Animation loop
  useEffect(() => {
    const animate = () => {
      if (!canvasRef.current) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.fillStyle = "rgba(10, 10, 20, 0.2)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 시간 업데이트
      timeRef.current += 0.016 // 약 60fps 기준 시간 증가

      // 수명이 다한 입자 필터링
      particlesRef.current = particlesRef.current.filter((particle) => particle.life > 0)

      particlesRef.current.forEach((particle) => {
        // 입자 수명 감소
        particle.life -= 0.5 // 수명 감소 속도 조절

        // 크기 변화 계산 (사인파 사용)
        const sizeChange =
          Math.sin(timeRef.current * particle.sizeSpeed * 10 + particle.sizeOffset) * particle.sizeVariation

        // 수명에 따른 크기 감소 효과 (수명이 다할수록 크기 감소)
        const lifeFactor = particle.life / particle.maxLife

        // 최종 크기 계산 (기본 크기 + 사인파 변화 + 수명 영향)
        particle.size = particle.baseSize + sizeChange * lifeFactor

        // Natural movement
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Boundary check
        if (particle.x > canvas.width) particle.x = 0
        if (particle.x < 0) particle.x = canvas.width
        if (particle.y > canvas.height) particle.y = 0
        if (particle.y < 0) particle.y = canvas.height

        // Mouse interaction
        if (isActive) {
          const dx = mouseRef.current.x - particle.x
          const dy = mouseRef.current.y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            const forceDirectionX = dx / distance
            const forceDirectionY = dy / distance
            const force = (150 - distance) / 150

            if (isFollowing) {
              particle.speedX += forceDirectionX * force * 0.2
              particle.speedY += forceDirectionY * force * 0.2
            } else {
              particle.speedX -= forceDirectionX * force * 0.2
              particle.speedY -= forceDirectionY * force * 0.2
            }
          }
        }

        // Speed limit
        particle.speedX = Math.min(Math.max(particle.speedX, -2), 2)
        particle.speedY = Math.min(Math.max(particle.speedY, -2), 2)

        // Gradually slow down
        particle.speedX *= 0.98
        particle.speedY *= 0.98

        // 수명에 따른 투명도 계산
        const opacity = particle.life / particle.maxLife

        // Draw particle with opacity
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.8})`
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, Math.max(0.1, particle.size), 0, Math.PI * 2)
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [
    isFollowing,
    isActive,
    settings.particleCount,
    settings.baseSize,
    settings.sizeVariation,
    settings.sizeSpeed,
    settings.speed,
  ])

  // 새 입자 생성 함수
  const createParticles = (x: number, y: number, count = 10) => {
    // 입자 수 제한 (성능 최적화를 위해)
    const maxParticles = 2000

    const newParticles: Particle[] = []

    for (let i = 0; i < count; i++) {
      // 새 입자의 수명 설정 (클릭/드래그로 생성된 입자는 더 짧은 수명)
      const maxLife = Math.random() * 200 + 100 // 100-300 프레임 (약 1.5-5초)
      const baseSize = Math.random() * 3 + 1 // 1-4 기본 크기

      newParticles.push({
        x: x,
        y: y,
        size: baseSize,
        baseSize: baseSize,
        sizeVariation: Math.random() * 1.5 + 1, // 1-2.5 크기 변화 범위 (사용자 생성 입자는 더 크게 변화)
        sizeSpeed: Math.random() * 0.03 + 0.02, // 0.02-0.05 크기 변화 속도 (사용자 생성 입자는 더 빠르게 변화)
        sizeOffset: Math.random() * Math.PI * 2, // 0-2π 위상 차이
        speedX: (Math.random() - 0.5) * 4,
        speedY: (Math.random() - 0.5) * 4,
        targetX: x,
        targetY: y,
        life: maxLife,
        maxLife: maxLife,
      })
    }

    // 최대 입자 수를 초과하면 가장 오래된 입자부터 제거
    if (particlesRef.current.length + newParticles.length > maxParticles) {
      const removeCount = particlesRef.current.length + newParticles.length - maxParticles
      particlesRef.current = particlesRef.current.slice(removeCount)
    }

    particlesRef.current = [...particlesRef.current, ...newParticles]
  }

  // 마우스 버튼이 눌려있을 때 지속적으로 입자 생성
  const startContinuousEmit = () => {
    if (emitIntervalRef.current) {
      clearInterval(emitIntervalRef.current)
    }

    emitIntervalRef.current = setInterval(() => {
      if (isMouseDownRef.current && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        const x = mouseRef.current.x
        const y = mouseRef.current.y
        createParticles(x, y, settings.emitCount)
      }
    }, settings.emitInterval)
  }

  // 마우스 버튼이 떼어졌을 때 입자 생성 중지
  const stopContinuousEmit = () => {
    if (emitIntervalRef.current) {
      clearInterval(emitIntervalRef.current)
      emitIntervalRef.current = null
    }
  }

  // 주기적으로 새 입자 생성 (기존 입자가 사라지면서 빈 공간을 채우기 위함)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!canvasRef.current) return

      // 현재 입자 수가 200개 미만이면 새 입자 추가
      if (particlesRef.current.length < 200) {
        const canvas = canvasRef.current
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height

        const maxLife = Math.random() * 300 + 200
        const baseSize = Math.random() * 2 + 1 // 1-3 기본 크기

        particlesRef.current.push({
          x: x,
          y: y,
          size: baseSize,
          baseSize: baseSize,
          sizeVariation: Math.random() * 1 + 0.5, // 0.5-1.5 크기 변화 범위
          sizeSpeed: Math.random() * 0.02 + 0.01, // 0.01-0.03 크기 변화 속도
          sizeOffset: Math.random() * Math.PI * 2, // 0-2π 위상 차이
          speedX: Math.random() * 1 - 0.5,
          speedY: Math.random() * 1 - 0.5,
          targetX: x,
          targetY: y,
          life: maxLife,
          maxLife: maxLife,
        })
      }
    }, 100) // 100ms마다 체크

    return () => clearInterval(interval)
  }, [])

  // Mouse event handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      mouseRef.current = { x, y }

      // 드래그 중일 때 입자 생성 (너무 많은 입자가 생성되지 않도록 제한)
      if (isMouseDownRef.current) {
        const now = Date.now()
        // 20ms마다 입자 생성 (초당 약 50번)
        if (now - lastEmitTimeRef.current > 20) {
          createParticles(x, y, 5) // 드래그 중에는 한 번에 5개씩 생성
          lastEmitTimeRef.current = now
        }
      }
    }

    const handleMouseEnter = () => {
      setIsActive(true)
    }

    const handleMouseLeave = () => {
      setIsActive(false)
      isDraggingRef.current = false // 캔버스를 벗어나면 드래그 상태 해제
      isMouseDownRef.current = false // 캔버스를 벗어나면 마우스 다운 상태 해제
      stopContinuousEmit() // 입자 생성 중지
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (!canvasRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      isDraggingRef.current = true
      isMouseDownRef.current = true // 마우스 다운 상태 설정

      // 클릭 시작 시 입자 생성
      createParticles(x, y, 20)

      // 지속적인 입자 생성 시작
      startContinuousEmit()
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
      isMouseDownRef.current = false // 마우스 다운 상태 해제

      // 지속적인 입자 생성 중지
      stopContinuousEmit()
    }

    if (canvasRef.current) {
      canvasRef.current.addEventListener("mousemove", handleMouseMove)
      canvasRef.current.addEventListener("mouseenter", handleMouseEnter)
      canvasRef.current.addEventListener("mouseleave", handleMouseLeave)
      canvasRef.current.addEventListener("mousedown", handleMouseDown)
      canvasRef.current.addEventListener("mouseup", handleMouseUp)

      // 전체 window에도 mouseup 이벤트 추가 (캔버스 밖에서 마우스를 놓는 경우 처리)
      window.addEventListener("mouseup", handleMouseUp)
    }

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener("mousemove", handleMouseMove)
        canvasRef.current.removeEventListener("mouseenter", handleMouseEnter)
        canvasRef.current.removeEventListener("mouseleave", handleMouseLeave)
        canvasRef.current.removeEventListener("mousedown", handleMouseDown)
        canvasRef.current.removeEventListener("mouseup", handleMouseUp)
      }
      window.removeEventListener("mouseup", handleMouseUp)
      stopContinuousEmit() // 인터벌 정리
    }
  }, [])

  // 패널 토글 함수
  const togglePanel = () => {
    setIsPanelCollapsed(!isPanelCollapsed)
    // 패널이 접힐 때 설정 메뉴도 닫기
    if (!isPanelCollapsed) {
      setIsSettingsOpen(false)
    }
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair" />

      {/* 패널 토글 버튼 (항상 표시) */}
      <button
        onClick={togglePanel}
        className={`absolute top-4 z-20 p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 shadow-lg transition-all duration-300 hover:bg-white/20 ${
          isPanelCollapsed ? "right-4" : "right-[calc(334px+1rem)]"
        }`}
        aria-label={isPanelCollapsed ? "패널 열기" : "패널 닫기"}
      >
        {isPanelCollapsed ? (
          <ChevronLeft size={20} className="text-white" />
        ) : (
          <ChevronRight size={20} className="text-white" />
        )}
      </button>

      {/* 개선된 UI 컨트롤 패널 */}
      <div
        className={`absolute top-4 right-4 z-10 p-5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg transition-all duration-300 ease-in-out ${
          isPanelCollapsed ? "translate-x-[calc(100%+1rem)] opacity-0" : "translate-x-0 opacity-100"
        }`}
        style={{ width: "320px" }}
      >
        <div className="flex flex-col items-center space-y-4">
          {/* 모드 전환 스위치 */}
          <div className="flex items-center gap-4 justify-between w-full">
            <div className="flex items-center space-x-2">
              <div
                className={`p-2 rounded-full ${!isFollowing ? "bg-purple-500/20 text-purple-300" : "text-gray-400"}`}
              >
                <MoonIcon size={20} />
              </div>
              <span className={`text-sm font-medium ${!isFollowing ? "text-purple-300" : "text-gray-400"}`}>
                피하기
              </span>
            </div>

            <Switch
              id="mode-switch"
              checked={isFollowing}
              onCheckedChange={setIsFollowing}
              className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-purple-500"
            />

            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${isFollowing ? "text-blue-300" : "text-gray-400"}`}>따라오기</span>
              <div className={`p-2 rounded-full ${isFollowing ? "bg-blue-500/20 text-blue-300" : "text-gray-400"}`}>
                <SunIcon size={20} />
              </div>
            </div>
          </div>

          {/* 설명 텍스트 */}
          <div className="w-full space-y-2 pt-3 border-t border-white/10">
            <p className="text-xs text-gray-200 font-medium">상호작용 방법:</p>
            <ul className="text-xs text-gray-300 space-y-1.5">
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 bg-white/60 rounded-full mr-2"></span>
                마우스를 움직여 입자와 상호작용
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 bg-white/60 rounded-full mr-2"></span>
                클릭하거나 드래그하여 입자 생성
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 bg-white/60 rounded-full mr-2"></span>
                마우스 버튼을 꾹 누르면 계속 생성
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 bg-white/60 rounded-full mr-2"></span>
                입자는 시간에 따라 크기가 변하고 사라짐
              </li>
            </ul>
          </div>

          {/* 설정 패널 토글 버튼 */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="w-full flex items-center justify-between p-2 text-sm text-gray-200 hover:bg-white/5 rounded-lg transition-colors"
          >
            <span>설정</span>
            {isSettingsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* 설정 패널 */}
          {isSettingsOpen && (
            <div className="w-full space-y-2 pt-3 border-t border-white/10">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-gray-200">기본 크기</label>
                    <span className="text-xs text-gray-300">{settings.baseSize.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.1"
                    value={settings.baseSize}
                    onChange={(e) => setSettings({ ...settings, baseSize: Number.parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-gray-200">크기 변화</label>
                    <span className="text-xs text-gray-300">{settings.sizeVariation.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={settings.sizeVariation}
                    onChange={(e) => setSettings({ ...settings, sizeVariation: Number.parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-gray-200">변화 속도</label>
                    <span className="text-xs text-gray-300">{settings.sizeSpeed.toFixed(3)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.001"
                    max="0.1"
                    step="0.001"
                    value={settings.sizeSpeed}
                    onChange={(e) => setSettings({ ...settings, sizeSpeed: Number.parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-gray-200">최대 수명</label>
                    <span className="text-xs text-gray-300">{settings.maxLife.toFixed(0)}</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="10"
                    value={settings.maxLife}
                    onChange={(e) => setSettings({ ...settings, maxLife: Number.parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-gray-200">속도</label>
                    <span className="text-xs text-gray-300">{settings.speed.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={settings.speed}
                    onChange={(e) => setSettings({ ...settings, speed: Number.parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-gray-200">입자 수</label>
                    <span className="text-xs text-gray-300">{settings.particleCount}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="10"
                    value={settings.particleCount}
                    onChange={(e) => setSettings({ ...settings, particleCount: Number.parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-gray-200">생성 개수</label>
                    <span className="text-xs text-gray-300">{settings.emitCount}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={settings.emitCount}
                    onChange={(e) => setSettings({ ...settings, emitCount: Number.parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-gray-200">생성 간격</label>
                    <span className="text-xs text-gray-300">{settings.emitInterval}ms</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={settings.emitInterval}
                    onChange={(e) => setSettings({ ...settings, emitInterval: Number.parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
