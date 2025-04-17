import type { Metadata } from 'next'
import AppleNumberGame from '../components/apple-number-game'

export const metadata: Metadata = {
  title: '사과 숫자 게임 - 께에임즈',
  description: '사과를 클릭하여 숫자를 맞추는 두뇌 게임입니다. 1부터 순서대로 클릭하여 최고 기록에 도전해보세요.',
  keywords: ['사과게임', '숫자게임', '두뇌게임', '순서게임', '기억력게임'],
  openGraph: {
    title: '사과 숫자 게임 - 께에임즈',
    description: '사과를 클릭하여 숫자를 맞추는 두뇌 게임입니다. 1부터 순서대로 클릭하여 최고 기록에 도전해보세요.',
  },
}

export default function AppleGamePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AppleNumberGame />
    </div>
  )
} 