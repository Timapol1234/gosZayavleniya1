import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Шаблоны заявлений | Готовые образцы документов для МФЦ, судов, банков',
  description:
    'Более 50 готовых шаблонов заявлений для МФЦ, судов, банков, ФНС, работодателей. Выберите подходящий шаблон и создайте документ за 5 минут.',
  keywords:
    'шаблоны заявлений, образцы заявлений, бланки документов, заявление МФЦ, исковое заявление образец, претензия образец, заявление на вычет',
  openGraph: {
    title: 'Шаблоны заявлений | Готовые образцы документов',
    description:
      'Более 50 готовых шаблонов заявлений для различных организаций. Юридически корректные документы.',
    type: 'website',
    locale: 'ru_RU',
    url: 'https://goszayavleniya.ru/templates',
  },
  alternates: {
    canonical: 'https://goszayavleniya.ru/templates',
  },
}

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
