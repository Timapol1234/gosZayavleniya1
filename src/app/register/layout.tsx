import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Регистрация | Создайте бесплатный аккаунт',
  description:
    'Зарегистрируйтесь в конструкторе заявлений для сохранения документов и быстрого доступа к своим заявлениям. Регистрация бесплатная.',
  keywords: 'регистрация, создать аккаунт, бесплатная регистрация',
  openGraph: {
    title: 'Регистрация | oneclickdoc',
    description:
      'Создайте бесплатный аккаунт для сохранения и управления вашими заявлениями',
    type: 'website',
    locale: 'ru_RU',
    url: 'https://oneclickdoc.ru/register',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
