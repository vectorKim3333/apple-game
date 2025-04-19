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
import { GameDifficulty } from "../types/game"
import { SPECIAL_TILE_RATIOS } from "../constants/gameConstants"

interface GameStartProps {
  onStartGame: (difficulty: GameDifficulty) => void
}

export default function GameStart({ onStartGame }: GameStartProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>(GameDifficulty.NORMAL)
  const [activeTab, setActiveTab] = useState("how-to-play")

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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="how-to-play">게임 방법</TabsTrigger>
              <TabsTrigger value="special-tiles">특수 타일</TabsTrigger>
            </TabsList>

            <TabsContent value="how-to-play" className="space-y-4">
              <img 
                src="/images/tile-game-demo3.gif" 
                alt="타일 게임 플레이 방법" 
                className="rounded-lg shadow-md mx-auto"
                style={{ imageRendering: "pixelated" }}
              />

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="rules">
                  <AccordionTrigger className="text-lg font-semibold">게임 규칙</AccordionTrigger>
                  <AccordionContent className="text-gray-700">
                    <div className="space-y-3">
                      <p>1. 같은 색상의 타일을 2개 이상 연결하여 매치를 만듭니다.</p>
                      <p>2. 타일은 가로나 세로로 연결되어야 하며, 한 번의 90도 방향 전환이 가능합니다. (ㄱ자, ㄴ자 모양 가능)</p>
                      <p>3. 매치가 완성되면 해당 타일들이 사라지고 점수를 획득합니다.</p>
                      <p>4. <button 
                              onClick={() => setActiveTab("special-tiles")}
                              className="text-blue-600 hover:text-blue-800 underline"
                          >특수 타일</button>을 활용하여 더 높은 점수를 획득하세요.</p>
                      <p>5. 제한 시간 안에 최대한 많은 점수를 획득하는 것이 목표입니다.</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible className="w-full">
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
                        <p className="text-sm">더 많은 2배 점수, 단 60초, 속도에 집중</p>
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
                      2배 점수
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

              <div className="mt-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="tile-distribution">
                    <AccordionTrigger className="text-lg font-semibold">특수 타일 분포</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {/* 쉬움 난이도 */}
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-700 mb-2">쉬움</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 mr-1 text-yellow-500" />
                              <span className="text-gray-700">타일의 {SPECIAL_TILE_RATIOS.easy.wild * 100}%</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-blue-500" />
                              <span className="text-gray-700">타일의 {SPECIAL_TILE_RATIOS.easy.time_bonus * 100}%</span>
                            </div>
                            <div className="flex items-center">
                              <Award className="h-4 w-4 mr-1 text-purple-500" />
                              <span className="text-gray-700">타일의 {SPECIAL_TILE_RATIOS.easy.multiplier * 100}%</span>
                            </div>
                            <div className="flex items-center">
                              <Zap className="h-4 w-4 mr-1 text-red-500" />
                              <span className="text-gray-700">타일의 {SPECIAL_TILE_RATIOS.easy.bomb * 100}%</span>
                            </div>
                          </div>
                        </div>

                        {/* 보통 난이도 */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-700 mb-2">보통</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 mr-1 text-yellow-500" />
                              <span className="text-gray-700">타일의 {SPECIAL_TILE_RATIOS.normal.wild * 100}%</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-blue-500" />
                              <span className="text-gray-700">타일의 {SPECIAL_TILE_RATIOS.normal.time_bonus * 100}%</span>
                            </div>
                            <div className="flex items-center">
                              <Award className="h-4 w-4 mr-1 text-purple-500" />
                              <span className="text-gray-700">타일의 {SPECIAL_TILE_RATIOS.normal.multiplier * 100}%</span>
                            </div>
                            <div className="flex items-center">
                              <Zap className="h-4 w-4 mr-1 text-red-500" />
                              <span className="text-gray-700">타일의 {SPECIAL_TILE_RATIOS.normal.bomb * 100}%</span>
                            </div>
                          </div>
                        </div>

                        {/* 어려움 난이도 */}
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-orange-700 mb-2">어려움</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 mr-1 text-yellow-500" />
                              <span className="text-gray-700">타일의 {SPECIAL_TILE_RATIOS.hard.wild * 100}%</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-blue-500" />
                              <span className="text-gray-700">타일의 {SPECIAL_TILE_RATIOS.hard.time_bonus * 100}%</span>
                            </div>
                            <div className="flex items-center">
                              <Award className="h-4 w-4 mr-1 text-purple-500" />
                              <span className="text-gray-700">타일의 {SPECIAL_TILE_RATIOS.hard.multiplier * 100}%</span>
                            </div>
                            <div className="flex items-center">
                              <Zap className="h-4 w-4 mr-1 text-red-500" />
                              <span className="text-gray-700">타일의 {SPECIAL_TILE_RATIOS.hard.bomb * 100}%</span>
                            </div>
                          </div>
                        </div>

                        {/* 타임 어택 난이도 */}
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-purple-700 mb-2">타임 어택</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 mr-1 text-yellow-500" />
                              <span className="text-gray-700">타일의 {SPECIAL_TILE_RATIOS.time_attack.wild * 100}%</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-blue-500" />
                              <span className="text-gray-700">타일의 {SPECIAL_TILE_RATIOS.time_attack.time_bonus * 100}%</span>
                            </div>
                            <div className="flex items-center">
                              <Award className="h-4 w-4 mr-1 text-purple-500" />
                              <span className="text-gray-700">타일의 {SPECIAL_TILE_RATIOS.time_attack.multiplier * 100}%</span>
                            </div>
                            <div className="flex items-center">
                              <Zap className="h-4 w-4 mr-1 text-red-500" />
                              <span className="text-gray-700">타일의 {SPECIAL_TILE_RATIOS.time_attack.bomb * 100}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
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
