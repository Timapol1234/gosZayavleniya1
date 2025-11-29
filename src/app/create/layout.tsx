import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Создание заявления | Пошаговое заполнение',
  description:
    'Создайте заявление с помощью пошагового конструктора. Заполните простую форму и получите готовый юридически корректный документ.',
  openGraph: {
    title: 'Создание заявления',
    description: 'Пошаговое создание юридически корректного документа',
    type: 'website',
    locale: 'ru_RU',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
