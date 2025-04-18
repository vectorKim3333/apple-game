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
    title: '사과 게임',
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
    <div className="game-page no-scroll">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Link 
              key={game.id} 
              href={game.path}
              className="block group"
            >
              <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-200 hover:scale-105">
                <div className="relative h-48 bg-gray-200">
                  <Image
                    src={game.imageUrl}
                    alt={game.title}
                    fill
                    className="object-fill"
                    priority
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600">
                    {game.title}
                  </h2>
                  <p className="text-gray-600">
                    {game.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}