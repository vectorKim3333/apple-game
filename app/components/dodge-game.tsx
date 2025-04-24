"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react"

// 게임 난이도 설정
const DIFFICULTY = {
  EASY: { bulletSpeed: 2, bulletSpawnRate: 100, bulletAcceleration: 0.0001 },
  NORMAL: { bulletSpeed: 3, bulletSpawnRate: 70, bulletAcceleration: 0.001 },
  HARD: { bulletSpeed: 6, bulletSpawnRate: 80, bulletAcceleration: 0.001 },
}

// 우주선과 총알 객체 타입 정의
type Spaceship = {
  x: number
  y: number
  width: number
  height: number
  speed: number
}

type Bullet = {
  x: number
  y: number
  radius: number
  speed: number
  angle: number
}

export default function DodgeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [difficulty, setDifficulty] = useState<"EASY" | "NORMAL" | "HARD">("NORMAL")
  const [shield, setShield] = useState(false)
  const [shieldCount, setShieldCount] = useState(2)
  const [shieldTimeout, setShieldTimeout] = useState<NodeJS.Timeout | null>(null)
  const [highScores, setHighScores] = useState<Record<"EASY" | "NORMAL" | "HARD", number>>({
    EASY: 0,
    NORMAL: 0,
    HARD: 0,
  })
  const difficultyRef = useRef<"EASY" | "NORMAL" | "HARD">("NORMAL")
  const gameStartedRef = useRef(false)
  const gameOverRef = useRef(false)
  const shieldRef = useRef(false)
  const shieldCountRef = useRef(2)

  // 게임 상태를 ref로 관리하여 렌더링 사이클과 독립적으로 유지
  const gameStateRef = useRef({
    spaceship: {
      x: 0,
      y: 0,
      width: 20,
      height: 20,
      speed: 5,
    } as Spaceship,
    bullets: [] as Bullet[],
    keys: {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
    },
    lastBulletTime: 0,
    startTime: 0,
    lastFrameTime: 0,
    difficultySettings: DIFFICULTY.NORMAL,
  })

  // 게임 시작 함수
  const startGame = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // 첫 프레임에서 timestamp를 받아 초기화하기 위해 임시 루프 실행
    const initLoop = (timestamp: number) => {
      gameStateRef.current = {
        spaceship: {
          x: canvas.width / 2 - 15,
          y: canvas.height - 60,
          width: 15,
          height: 15,
          speed: 5,
        },
        bullets: [],
        keys: {
          ArrowUp: false,
          ArrowDown: false,
          ArrowLeft: false,
          ArrowRight: false,
        },
        lastBulletTime: 0,
        startTime: timestamp,
        lastFrameTime: timestamp,
        difficultySettings: DIFFICULTY[difficultyRef.current],
      }
      setGameStarted(true)
      setGameOver(false)
      setShield(false)
      setShieldCount(2)
      if (shieldTimeout) clearTimeout(shieldTimeout)
      requestAnimationFrame(gameLoop)
    }
    requestAnimationFrame(initLoop)
  }

  // 키보드 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault()
        gameStateRef.current.keys[e.key as keyof typeof gameStateRef.current.keys] = true
      }
      if (e.key === "r" || e.key === "R" || e.key === "ㄱ" ) {
        if (gameOverRef.current || gameStartedRef.current) {
          startGame()
        }
      }
      if ((e.key === "q" || e.key === "Q") && !shieldRef.current && shieldCountRef.current > 0 && gameStartedRef.current && !gameOverRef.current) {
        setShield(true)
        setShieldCount((prev) => prev - 1)
        if (shieldTimeout) clearTimeout(shieldTimeout)
        const timeout = setTimeout(() => {
          setShield(false)
        }, 1000)
        setShieldTimeout(timeout)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault()
        gameStateRef.current.keys[e.key as keyof typeof gameStateRef.current.keys] = false
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  // 난이도 변경 시 설정 업데이트
  useEffect(() => {
    difficultyRef.current = difficulty
  }, [difficulty])

  // Canvas 크기 설정 및 게임 루프 시작
  useEffect(() => {
    if (gameStarted && !gameOver) {
      const canvas = canvasRef.current
      if (canvas) {
        // Canvas 크기 설정 확인
        if (canvas.width === 0) {
          canvas.width = 600
          canvas.height = 400
        }

        // 게임 루프 시작
        requestAnimationFrame(gameLoop)
      }
    }
  }, [gameStarted, gameOver])

  useEffect(() => {
    gameStartedRef.current = gameStarted
  }, [gameStarted])

  useEffect(() => {
    gameOverRef.current = gameOver
  }, [gameOver])

  useEffect(() => {
    shieldRef.current = shield
  }, [shield])

  useEffect(() => {
    shieldCountRef.current = shieldCount
  }, [shieldCount])

  // 게임 시작 시 최고 기록 불러오기
  useEffect(() => {
    const savedHighScores = localStorage.getItem('dodgeGameHighScores')
    if (savedHighScores) {
      setHighScores(JSON.parse(savedHighScores))
    }
  }, [])

  // 게임 루프
  const gameLoop = (timestamp: number) => {
    if (!gameStarted || gameOver) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const gameState = gameStateRef.current

    // 생존 시간 업데이트 (requestAnimationFrame 타임스탬프 사용)
    const deltaTime = timestamp - gameState.lastFrameTime
    gameState.lastFrameTime = timestamp
    
    // 우주선 이동 처리
    if (gameState.keys.ArrowLeft) {
      gameState.spaceship.x = Math.max(0, gameState.spaceship.x - gameState.spaceship.speed)
    }
    if (gameState.keys.ArrowRight) {
      gameState.spaceship.x = Math.min(
        canvas.width - gameState.spaceship.width,
        gameState.spaceship.x + gameState.spaceship.speed,
      )
    }
    if (gameState.keys.ArrowUp) {
      gameState.spaceship.y = Math.max(0, gameState.spaceship.y - gameState.spaceship.speed)
    }
    if (gameState.keys.ArrowDown) {
      gameState.spaceship.y = Math.min(
        canvas.height - gameState.spaceship.height,
        gameState.spaceship.y + gameState.spaceship.speed,
      )
    }

    // 총알 생성 (난이도에 따른 간격으로)
    if (timestamp - gameState.lastBulletTime > gameState.difficultySettings.bulletSpawnRate) {
      // 난이도에 따라 총알 속도 증가
      const currentBulletSpeed =
        gameState.difficultySettings.bulletSpeed + deltaTime * gameState.difficultySettings.bulletAcceleration

      // 새 총알 생성
      const newBullet: Bullet = {
        x: Math.random() * canvas.width,
        y: 0,
        radius: 3,
        speed: currentBulletSpeed,
        angle: Math.random() * Math.PI * 0.5 + Math.PI * 0.25, // 45도 ~ 135도 사이 각도
      }

      gameState.bullets.push(newBullet)
      gameState.lastBulletTime = timestamp
    }

    // 총알 이동 및 충돌 검사
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
      const bullet = gameState.bullets[i]

      // 총알 이동
      bullet.x += Math.cos(bullet.angle) * bullet.speed
      bullet.y += Math.sin(bullet.angle) * bullet.speed

      // 화면 밖으로 나간 총알 제거
      if (bullet.y > canvas.height || bullet.x < 0 || bullet.x > canvas.width) {
        gameState.bullets.splice(i, 1)
        continue
      }

      // 충돌 검사 (간단한 사각형-원 충돌)
      const ship = gameState.spaceship
      const dx = Math.abs(bullet.x - (ship.x + ship.width / 2))
      const dy = Math.abs(bullet.y - (ship.y + ship.height / 2))

      if (!shieldRef.current && dx <= ship.width / 2 + bullet.radius && dy <= ship.height / 2 + bullet.radius) {
        // 충돌 발생, 게임 오버
        const currentTime = (gameState.lastFrameTime - gameState.startTime) / 1000
        if (currentTime > highScores[difficultyRef.current]) {
          const newHighScores = { ...highScores, [difficultyRef.current]: currentTime }
          setHighScores(newHighScores)
          localStorage.setItem('dodgeGameHighScores', JSON.stringify(newHighScores))
        }
        setGameOver(true)
        return
      }
    }

    // 게임 요소 그리기
    drawGame(ctx, gameState)

    // 다음 프레임 요청
    if (!gameOver) {
      requestAnimationFrame(gameLoop)
    }
  }

  // 게임 요소 그리기 함수
  const drawGame = (ctx: CanvasRenderingContext2D, gameState: typeof gameStateRef.current) => {
    // 배경 그리기
    ctx.fillStyle = "#000022"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // 보호막 표시 (우주선 주위에 원)
    if (shieldRef.current) {
      const ship = gameState.spaceship
      ctx.save()
      ctx.strokeStyle = "#00ffff"
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(ship.x + ship.width / 2, ship.y + ship.height / 2, ship.width, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    // 우주선 그리기
    const ship = gameState.spaceship
    // 엔진 불빛 효과
    const gradient = ctx.createLinearGradient(
      ship.x + ship.width / 2,
      ship.y + ship.height,
      ship.x + ship.width / 2,
      ship.y + ship.height + 15
    )
    gradient.addColorStop(0, "#ff6b6b")
    gradient.addColorStop(1, "transparent")
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.moveTo(ship.x + ship.width / 2 - 5, ship.y + ship.height)
    ctx.lineTo(ship.x + ship.width / 2 + 5, ship.y + ship.height)
    ctx.lineTo(ship.x + ship.width / 2, ship.y + ship.height + 15)
    ctx.closePath()
    ctx.fill()

    // 우주선 본체
    ctx.fillStyle = "#3498db"
    ctx.beginPath()
    // 우주선 상단
    ctx.moveTo(ship.x + ship.width / 2, ship.y)
    // 우주선 왼쪽 날개
    ctx.lineTo(ship.x, ship.y + ship.height - 5)
    // 우주선 하단
    ctx.lineTo(ship.x + ship.width / 2, ship.y + ship.height)
    // 우주선 오른쪽 날개
    ctx.lineTo(ship.x + ship.width, ship.y + ship.height - 5)
    ctx.closePath()
    ctx.fill()

    // 우주선 테두리 추가
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 2
    ctx.stroke()

    // 우주선 창문
    ctx.fillStyle = "#a8e6cf"
    ctx.beginPath()
    ctx.arc(ship.x + ship.width / 2, ship.y + ship.height / 3, 3, 0, Math.PI * 2)
    // 총알 그리기
    ctx.fillStyle = "#e74c3c"
    gameState.bullets.forEach((bullet) => {
      ctx.beginPath()
      ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2)
      ctx.fill()

      // 총알 테두리 추가
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 1
      ctx.stroke()
    })

    // 게임 정보 그리기
    ctx.fillStyle = "#ffffff"
    ctx.font = "16px Arial"
    ctx.textAlign = "left"
    ctx.fillText(`총알 개수: ${gameState.bullets.length}`, 10, ctx.canvas.height - 10)

    // 스킬(보호막) 정보 왼쪽 위에 작게 표시
    ctx.font = "12px Arial"
    ctx.fillStyle = shieldRef.current ? "#00ffff" : "#cccccc"
    ctx.fillText(`Q: 보호막 (${shieldCountRef.current}/2)`, 10, 24)

    ctx.textAlign = "right"
    const elapsedTime = ((gameState.lastFrameTime - gameState.startTime) / 1000).toFixed(1)
    ctx.fillText(`생존 시간: ${elapsedTime}초`, ctx.canvas.width - 10, ctx.canvas.height - 10)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <h1 className="text-3xl font-bold text-white mb-6">
        <span className="text-red-500">닷지게임</span>
      </h1>

      <div className="relative border-4 border-gray-700 rounded-lg overflow-hidden shadow-lg mb-6">
        <canvas ref={canvasRef} width={600} height={400} className="bg-black" />

        {!gameStarted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <div className="w-full max-w-md p-6 rounded-lg">
              <div className="flex justify-center mb-6">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div></div>
                  <div className="bg-gray-800 p-2 rounded flex justify-center">
                    <ArrowUp className="h-5 w-5 text-white" />
                  </div>
                  <div></div>
                  <div className="bg-gray-800 p-2 rounded flex justify-center">
                    <ArrowLeft className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-gray-800 p-2 rounded flex justify-center">
                    <ArrowDown className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-gray-800 p-2 rounded flex justify-center">
                    <ArrowRight className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-white text-center mb-4 font-medium">난이도 선택</h3>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setDifficulty("EASY")}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      difficulty === "EASY"
                        ? "bg-green-500 text-white font-medium"
                        : "bg-gray-700 text-green-300 hover:bg-gray-600"
                    }`}
                  >
                    쉬움
                  </button>
                  <button
                    onClick={() => setDifficulty("NORMAL")}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      difficulty === "NORMAL"
                        ? "bg-yellow-500 text-white font-medium"
                        : "bg-gray-700 text-yellow-300 hover:bg-gray-600"
                    }`}
                  >
                    보통
                  </button>
                  <button
                    onClick={() => setDifficulty("HARD")}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      difficulty === "HARD"
                        ? "bg-red-500 text-white font-medium"
                        : "bg-gray-700 text-red-300 hover:bg-gray-600"
                    }`}
                  >
                    고수
                  </button>
                </div>
              </div>

              <Button
                onClick={startGame}
                className="w-full py-3 text-lg font-bold bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                게임 시작
              </Button>

              <p className="text-gray-400 text-xs text-center mt-4">방향키로 우주선을 조종하여 총알을 피하세요</p>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-xs w-full">
              <h2 className="text-2xl text-red-500 mb-4">게임 오버</h2>
              <p className="text-white text-3xl font-bold mb-4">{((gameStateRef.current.lastFrameTime - gameStateRef.current.startTime) / 1000).toFixed(1)}초</p>
              <p className="text-yellow-400 text-xl mb-4">
                {difficulty === "EASY" && `최고 기록: ${highScores.EASY.toFixed(1)}초`}
                {difficulty === "NORMAL" && `최고 기록: ${highScores.NORMAL.toFixed(1)}초`}
                {difficulty === "HARD" && `최고 기록: ${highScores.HARD.toFixed(1)}초`}
              </p>
              <Button onClick={startGame} className="w-full py-2 bg-blue-600 hover:bg-blue-700 mb-2">
                다시 시작 <span className="text-xs text-gray-300">(재시작 단축키 R)</span>
              </Button>
              <Button onClick={() => { setGameOver(false); setGameStarted(false); }} className="w-full py-2 bg-gray-600 hover:bg-gray-700">
                돌아가기
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
