import { Metadata } from 'next'
import TileGame from '../components/tile-game'

export const metadata: Metadata = {
  title: '타일 게임 - 께에임즈',
  description: '같은 색상의 타일을 연결해 높은 점수를 노리는 전략 퍼즐 게임! 제한 시간 내 최대한 많은 타일을 연결하고, 순발력과 두뇌를 겨뤄보세요.',
  keywords: ['타일게임', '색상연결', '퍼즐게임', '전략게임', '순발력', '두뇌게임', '무료게임', 'GGGGame', '께에임즈'],
  openGraph: {
    title: '타일 게임 - 께에임즈',
    description: '같은 색상의 타일을 연결해 높은 점수를 노리는 전략 퍼즐 게임! 제한 시간 내 최대한 많은 타일을 연결하고, 순발력과 두뇌를 겨뤄보세요.',
    images: ['/images/color-tiles-thumbnail.png']
  }
} 

export default function ColorTilesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <TileGame />
      </div>
    </div>
  )
} 