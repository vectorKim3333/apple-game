import type { Metadata } from 'next'
import WaterMeditation from '../components/water-meditation'

export const metadata: Metadata = {
  title: '물멍 - 께에임즈',
  description: '돌을 던져 잔잔한 물결을 감상하며 명상과 힐링을 경험하세요. 웹에서 무료로 즐기는 마음 안정, 스트레스 해소용 인터랙티브 명상 게임!',
  keywords: ['물멍', '명상', '힐링', '물결', '스트레스해소', '마음안정', '무료게임', '인터랙티브', 'GGGGame', '께에임즈'],
  openGraph: {
    title: '물멍 - 께에임즈',
    description: '돌을 던져 잔잔한 물결을 감상하며 명상과 힐링을 경험하세요. 웹에서 무료로 즐기는 마음 안정, 스트레스 해소용 인터랙티브 명상 게임!',
  },
}

export default function WaterMeditationPage() {
  return (
    <div className="game-page no-scroll h-full">
      <WaterMeditation />
    </div>
  )
} 