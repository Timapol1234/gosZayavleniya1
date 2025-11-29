import type { Metadata } from 'next'
import { Public_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import SessionProvider from '@/components/providers/SessionProvider'
import { ToastProvider } from '@/components/providers/ToastProvider'
import CookieNotice from '@/components/ui/CookieNotice'
import './globals.css'

const publicSans = Public_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-public-sans',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://goszayavleniya.ru'),
  title: {
    default: 'Конструктор заявлений | Создайте заявление за 5 минут',
    template: '%s | Конструктор заявлений',
  },
  description:
    'Простой конструктор для создания юридически верных заявлений в МФЦ, суды, банки, ФНС. Более 50 шаблонов. Бесплатно.',
  keywords:
    'заявление, конструктор, МФЦ, суд, банк, налоговая, шаблон, документы',
  authors: [{ name: 'Конструктор заявлений' }],
  creator: 'Конструктор заявлений',
  publisher: 'Конструктор заявлений',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://goszayavleniya.ru',
    siteName: 'Конструктор заявлений',
    title: 'Конструктор заявлений',
    description: 'Создайте юридически верное заявление за 5 минут',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Конструктор заявлений',
    description: 'Создайте юридически верное заявление за 5 минут',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when you have them
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className={publicSans.variable}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <SessionProvider>
          <ToastProvider>
            {children}
            <CookieNotice />
          </ToastProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  )
}
