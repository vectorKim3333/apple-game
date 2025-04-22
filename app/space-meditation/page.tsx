import type { Metadata } from 'next'
import StarMeditation from '../components/star-meditation'

export const metadata: Metadata = {
  title: '별멍 - 께에임즈',
  description: '별 조각을 감상합니다.',
  keywords: ['별', '힐링 게임', '안정감', '스트레스 해소', '무료게임', 'GGGGame', '께에임즈'],
  openGraph: {
    title: '별멍 - 께에임즈',
    description: '별 조각을 별 조각을 생성하고 감상합니다.',
  },
}

export default function AppleGamePage() {
  return (
    <div className="game-page no-scroll h-full">
      <StarMeditation />
    </div>
  )
} 