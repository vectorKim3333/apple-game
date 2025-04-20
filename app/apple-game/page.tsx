import type { Metadata } from 'next'
import AppleNumberGame from '../components/apple-number-game'

export const metadata: Metadata = {
  title: '사과 게임 - 께에임즈',
  description: '합이 10이 되도록 사과를 선택해 점수를 얻는 두뇌 퍼즐 게임! 온라인 대전, 썩은 사과 모드, 다양한 도구 등 전략적 재미를 경험하세요.',
  keywords: ['사과게임', '합이 10', '두뇌게임', '온라인 대전', '썩은 사과', '퍼즐게임', '전략게임', '무료게임', 'GGGGame', '께에임즈'],
  openGraph: {
    title: '사과 게임 - 께에임즈',
    description: '합이 10이 되도록 사과를 선택해 점수를 얻는 두뇌 퍼즐 게임! 온라인 대전, 썩은 사과 모드, 다양한 도구 등 전략적 재미를 경험하세요.',
  },
}

export default function AppleGamePage() {
  return (
    <div className="game-page no-scroll h-full">
      <AppleNumberGame />
    </div>
  )
} 