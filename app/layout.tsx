import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '께에임즈 - 사과게임, 물멍 등 다양한 게임을 한곳에서',
  description: '사과 게임으로 두뇌를 단련하고, 물멍으로 마음의 안정을 찾아보세요. 무료로 즐길 수 있는 다양한 게임이 준비되어 있습니다.',
  keywords: ['사과게임', '물멍', '게임', '두뇌게임', '힐링게임', '무료게임', '웹게임', '브라우저게임'],
  openGraph: {
    title: '께에임즈 - 사과게임, 물멍 등 다양한 게임을 한곳에서',
    description: '사과 게임으로 두뇌를 단련하고, 물멍으로 마음의 안정을 찾아보세요. 무료로 즐길 수 있는 다양한 게임이 준비되어 있습니다.',
    type: 'website',
    locale: 'ko_KR',
    siteName: '께에임즈',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-white min-h-screen flex flex-col`}>
        <header className="py-4 bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <Link href="/" className="text-2xl font-bold hover:text-blue-600">
              께에임즈
            </Link>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <footer className="py-4 text-center text-sm text-gray-600 bg-white">
          <div className="space-x-4">
            <Link href="/privacy" className="hover:text-gray-900">개인정보 처리방침</Link>
            <Link href="/terms" className="hover:text-gray-900">이용약관</Link>
          </div>
          <div className="mt-2">
            © 2024 께에임즈. All rights reserved.
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  )
}
