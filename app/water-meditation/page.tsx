import type { Metadata } from 'next'
import WaterMeditation from '../components/water-meditation'

export const metadata: Metadata = {
  title: '물멍 - 께에임즈',
  description: '잔잔한 물결을 보며 마음의 안정을 찾아보세요. 돌을 던지고 물결이 퍼져나가는 모습을 보며 힐링할 수 있는 명상 게임입니다.',
  keywords: ['물멍', '명상', '힐링', '물결', '웰빙', '스트레스해소', '마음안정'],
  openGraph: {
    title: '물멍 - 께에임즈',
    description: '잔잔한 물결을 보며 마음의 안정을 찾아보세요. 돌을 던지고 물결이 퍼져나가는 모습을 보며 힐링할 수 있는 명상 게임입니다.',
  },
}

export default function WaterMeditationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <WaterMeditation />
    </div>
  )
} 