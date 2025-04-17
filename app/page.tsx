import Link from 'next/link';
import Image from 'next/image';

interface Game {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  path: string;
}

const games: Game[] = [
  {
    id: 'apple-game',
    title: '사과 숫자 게임',
    description: '사과를 클릭하여 숫자를 맞추는 게임입니다.',
    imageUrl: '/images/apple-game-thumbnail.png',
    path: '/apple-game'
  },
  {
    id: 'water-meditation',
    title: '물멍',
    description: '잔잔한 물결을 보며 마음의 안정을 찾아보세요.',
    imageUrl: '/images/water-meditation-thumbnail.png',
    path: '/water-meditation'
  },
  // 추후 다른 게임들이 추가될 예정
];

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        께에임즈에서 다양한 게임을 즐겨보세요
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <Link href="/apple-game" className="block">
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-2">사과 숫자 게임</h2>
              <p className="text-gray-600 mb-4">
                1부터 순서대로 사과를 클릭하여 두뇌를 단련하세요. 
                빠른 시간 안에 모든 숫자를 맞추고 최고 기록에 도전해보세요.
              </p>
              <div className="text-blue-600 font-semibold">게임 시작하기 →</div>
            </div>
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <Link href="/water-meditation" className="block">
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-2">물멍</h2>
              <p className="text-gray-600 mb-4">
                잔잔한 물결을 보며 마음의 안정을 찾아보세요. 
                돌을 던지고 퍼져나가는 물결을 보며 힐링하는 시간을 가져보세요.
              </p>
              <div className="text-blue-600 font-semibold">명상 시작하기 →</div>
            </div>
          </Link>
        </div>
      </div>
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">게임 소개</h2>
        <div className="space-y-6">
          <article>
            <h3 className="text-xl font-medium mb-2">사과 숫자 게임이란?</h3>
            <p className="text-gray-600">
              사과 숫자 게임은 순발력과 기억력을 향상시키는 두뇌 훈련 게임입니다.
              화면에 무작위로 배치된 사과들을 1부터 순서대로 클릭하여 
              최대한 빠른 시간 안에 모든 숫자를 맞추는 것이 목표입니다.
            </p>
          </article>
          <article>
            <h3 className="text-xl font-medium mb-2">물멍이란?</h3>
            <p className="text-gray-600">
              물멍은 '물을 멍하니 바라보다'라는 의미의 신조어입니다.
              잔잔한 물결과 상호작용하며 마음의 안정을 찾고,
              일상의 스트레스를 해소할 수 있는 힐링 명상 게임입니다.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}