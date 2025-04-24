import type { Metadata } from 'next'
import DodgeGame from '../components/dodge-game'

export const metadata: Metadata = {
  title: '닷지 게임 - 께에임즈',
  description: '총알을 피하면서 버티는 게임입니다.',
  keywords: ['닷지게임', '곰플레이어', '총알피하기', '두뇌게임', '순발력 게임', '닷지', '무료게임', 'GGGGame', '께에임즈'],
}

export default function DodgeGamePage() {
  return (
    <div className="game-page no-scroll h-full">
      <DodgeGame /> 
    </div>
  )
} 