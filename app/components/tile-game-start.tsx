"use client"

import { useState } from "react"
import { Star, Zap, Clock, Award, Play, Info, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// 타일 게임에서 게임 난이도 열거형 가져오기
import { GameDifficulty } from "./tile-game"

interface GameStartProps {
  onStartGame: (difficulty: GameDifficulty) => void
}

export default function GameStart({ onStartGame }: GameStartProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>(GameDifficulty.NORMAL)

  // 난이도 이름 표시용 함수
  const getDifficultyName = (diff: GameDifficulty) => {
    switch (diff) {
      case GameDifficulty.EASY:
        return "쉬움"
      case GameDifficulty.NORMAL:
        return "보통"
      case GameDifficulty.HARD:
        return "어려움"
      case GameDifficulty.TIME_ATTACK:
        return "타임 어택"
    }
  }

  return (
    <div className="flex flex-col items-center max-w-4xl w-full mx-auto">
      <Card className="w-full bg-white shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white text-center">
          <h1 className="text-4xl font-bold">타일 게임</h1>
        </div>

        <CardContent className="p-6">
          <Tabs defaultValue="how-to-play" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="how-to-play">게임 방법</TabsTrigger>
              <TabsTrigger value="special-tiles">특수 타일</TabsTrigger>
            </TabsList>

            <TabsContent value="how-to-play" className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold flex items-center mb-2">
                  게임 플레이
                </h3>
                <img 
                  src="/images/tile-game-demo.gif" 
                  alt="타일 게임 플레이 방법" 
                  className="w-full rounded-lg shadow-md"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>

              <Accordion type="single" defaultValue="difficulty" collapsible className="w-full">
                <AccordionItem value="difficulty">
                  <AccordionTrigger className="text-lg font-semibold">난이도 레벨</AccordionTrigger>
                  <AccordionContent className="text-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-green-50 p-3 rounded-md">
                        <h4 className="font-semibold text-green-700">쉬움</h4>
                        <p className="text-sm">더 많은 특수 타일, 150초, 55% 보드 채움</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-md">
                        <h4 className="font-semibold text-blue-700">보통</h4>
                        <p className="text-sm">균형 잡힌 특수 타일, 120초, 60% 보드 채움</p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-md">
                        <h4 className="font-semibold text-orange-700">어려움</h4>
                        <p className="text-sm">적은 특수 타일, 90초, 65% 보드 채움</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-md">
                        <h4 className="font-semibold text-purple-700">타임 어택</h4>
                        <p className="text-sm">더 많은 멀티플라이어, 단 60초, 속도에 집중</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

            </TabsContent>

            <TabsContent value="special-tiles">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-yellow-200 shadow-sm">
                  <CardHeader className="bg-yellow-50 p-4">
                    <CardTitle className="text-lg flex items-center">
                      <Star className="h-5 w-5 mr-2 text-yellow-500" />
                      와일드 카드
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-gray-700">
                      어떤 색상의 타일과도 매치됩니다.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 shadow-sm">
                  <CardHeader className="bg-blue-50 p-4">
                    <CardTitle className="text-lg flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-blue-500" />
                      시간 보너스
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-gray-700">
                      매치될 때 타이머에 15초를 추가합니다.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 shadow-sm">
                  <CardHeader className="bg-purple-50 p-4">
                    <CardTitle className="text-lg flex items-center">
                      <Award className="h-5 w-5 mr-2 text-purple-500" />
                      멀티플라이어
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-gray-700">
                      매치에서 얻는 점수를 두 배로 늘립니다
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-red-200 shadow-sm">
                  <CardHeader className="bg-red-50 p-4">
                    <CardTitle className="text-lg flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-red-500" />
                      폭탄
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-gray-700">
                      매치될 때 인접한 모든 타일을 제거합니다.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">특수 타일 분포</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    <span className="text-gray-700">타일의 3%</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-blue-500" />
                    <span className="text-gray-700">타일의 1.5%</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-1 text-purple-500" />
                    <span className="text-gray-700">타일의 2.5%</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-1 text-red-500" />
                    <span className="text-gray-700">타일의 1%</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-center justify-end gap-4 p-6 bg-gray-50 border-t">
          <div className="mb-4 sm:mb-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  <span>{getDifficultyName(selectedDifficulty)}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>난이도 선택</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedDifficulty(GameDifficulty.EASY)}>쉬움</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedDifficulty(GameDifficulty.NORMAL)}>보통</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedDifficulty(GameDifficulty.HARD)}>어려움</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedDifficulty(GameDifficulty.TIME_ATTACK)}>
                  타임 어택
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button
            size="lg"
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-6 text-lg font-semibold transition-all duration-200 hover:scale-105 shadow-md"
            onClick={() => onStartGame(selectedDifficulty)}
          >
            <Play className="h-5 w-5 mr-2" />
            게임 시작
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
