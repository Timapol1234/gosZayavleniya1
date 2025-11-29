import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Личный кабинет | Мои заявления и документы',
  description:
    'Управляйте своими заявлениями и документами в личном кабинете. Просматривайте, редактируйте и скачивайте созданные документы.',
  openGraph: {
    title: 'Личный кабинет | Мои документы',
    description: 'Управление заявлениями и документами',
    type: 'website',
    locale: 'ru_RU',
    url: 'https://goszayavleniya.ru/dashboard',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
