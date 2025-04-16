import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { Analytics } from '@vercel/analytics/react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '사과 숫자 게임',
  description: '사과를 클릭하여 숫자를 맞추는 게임입니다.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* Google AdSense 스크립트 */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1563226922053554"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <footer className="mt-auto py-4 text-center text-sm text-gray-600">
            <div className="space-x-4">
              <Link href="/privacy" className="hover:text-gray-900">개인정보 처리방침</Link>
              <Link href="/terms" className="hover:text-gray-900">이용약관</Link>
            </div>
            <div className="mt-2">
              © 2024 사과 숫자 게임. All rights reserved.
            </div>
          </footer>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
