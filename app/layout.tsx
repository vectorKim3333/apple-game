import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '께에임즈',
  description: '다양한 게임을 한곳에서 즐겨보세요!',
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
