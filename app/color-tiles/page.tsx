import { Metadata } from 'next'
import TileGame from '../components/tile-game'

export const metadata: Metadata = {
  title: '타일 게임 - 미니게임 모음',
  description: '같은 색상의 타일을 연결하여 점수를 얻는 게임입니다. 제한 시간 내에 최대한 많은 점수를 획득해보세요!',
  openGraph: {
    title: '타일 게임 - 미니게임 모음',
    description: '같은 색상의 타일을 연결하여 점수를 얻는 게임입니다. 제한 시간 내에 최대한 많은 점수를 획득해보세요!',
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