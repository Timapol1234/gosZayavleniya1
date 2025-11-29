import type { Metadata } from 'next'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import {
  OrganizationSchema,
  WebSiteSchema,
  ItemListSchema,
} from '@/components/seo/StructuredData'

export const metadata: Metadata = {
  title: 'Конструктор заявлений онлайн | Создайте заявление за 5 минут бесплатно',
  description:
    'Простой конструктор для создания юридически верных заявлений в МФЦ, суды, банки, ФНС. Более 50 готовых шаблонов документов. Бесплатно и без регистрации.',
  keywords:
    'заявление онлайн, конструктор заявлений, шаблоны заявлений, МФЦ заявление, исковое заявление, налоговый вычет, претензия в банк, документы онлайн',
  openGraph: {
    title: 'Конструктор заявлений | Создайте документ за 5 минут',
    description:
      'Создавайте юридически корректные заявления для МФЦ, судов, банков и других организаций. Просто, быстро, бесплатно.',
    type: 'website',
    locale: 'ru_RU',
    url: 'https://goszayavleniya.ru',
    siteName: 'Конструктор заявлений',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Конструктор заявлений | Создайте документ за 5 минут',
    description:
      'Создавайте юридически корректные заявления для МФЦ, судов, банков. Бесплатно.',
  },
  alternates: {
    canonical: 'https://goszayavleniya.ru',
  },
}

export default function HomePage() {
  const categories = [
    {
      icon: 'account_balance',
      name: 'МФЦ и госуслуги',
      description: 'Заявления в МФЦ, получение документов',
      slug: 'mfc-gosuslugi',
    },
    {
      icon: 'gavel',
      name: 'Суды',
      description: 'Исковые заявления, жалобы в суд',
      slug: 'courts',
    },
    {
      icon: 'account_balance_wallet',
      name: 'Банки',
      description: 'Претензии в банк, возврат средств',
      slug: 'banks',
    },
    {
      icon: 'receipt_long',
      name: 'ФНС',
      description: 'Налоговые вычеты, регистрация ИП',
      slug: 'fns',
    },
    {
      icon: 'work',
      name: 'Работодатели',
      description: 'Заявления на отпуск, увольнение',
      slug: 'employers',
    },
    {
      icon: 'business',
      name: 'Другие организации',
      description: 'ЖКХ, образование, здравоохранение',
      slug: 'other',
    },
  ]

  const steps = [
    {
      icon: 'search',
      title: 'Выберите шаблон',
      description: 'Найдите нужный тип заявления из нашей базы',
    },
    {
      icon: 'edit_note',
      title: 'Заполните форму',
      description: 'Ответьте на простые вопросы пошагово',
    },
    {
      icon: 'download',
      title: 'Скачайте документ',
      description: 'Получите готовый PDF для печати или отправки',
    },
  ]

  // Prepare structured data for categories
  const categoryServices = categories.map((cat) => ({
    name: cat.name,
    description: cat.description,
    url: `https://goszayavleniya.ru/templates?category=${cat.slug}`,
  }))

  return (
    <>
      {/* Structured Data */}
      <OrganizationSchema />
      <WebSiteSchema />
      <ItemListSchema
        name="Категории заявлений"
        items={categoryServices}
      />

      <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-blue-600 py-20 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-5xl font-bold">
              Создавайте заявления легко и быстро
            </h1>
            <p className="mb-8 text-xl opacity-90">
              Конструктор юридически корректных документов для МФЦ, судов,
              банков и госорганов
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/templates">
                <Button size="lg" variant="secondary">
                  Выбрать шаблон
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white hover:text-primary">
                  Начать бесплатно
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container-custom">
          <h2 className="mb-12 text-center text-3xl font-bold text-text-primary">
            Категории заявлений
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/templates?category=${category.slug}`}
              >
                <Card hoverable className="h-full transition-all">
                  <div className="flex items-start space-x-4">
                    <span className="material-symbols-outlined text-4xl text-primary">
                      {category.icon}
                    </span>
                    <div className="flex-1">
                      <h3 className="mb-2 text-lg font-semibold text-text-primary">
                        {category.name}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-background-light py-16">
        <div className="container-custom">
          <h2 className="mb-12 text-center text-3xl font-bold text-text-primary">
            Как это работает
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
                    <span className="material-symbols-outlined text-3xl">
                      {step.icon}
                    </span>
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-text-primary">
                  {step.title}
                </h3>
                <p className="text-text-secondary">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container-custom">
          <Card className="bg-gradient-to-r from-primary to-blue-600 text-white">
            <div className="text-center">
              <h2 className="mb-4 text-3xl font-bold">
                Готовы создать свое первое заявление?
              </h2>
              <p className="mb-8 text-lg opacity-90">
                Более 50 шаблонов документов доступны бесплатно
              </p>
              <Link href="/templates">
                <Button size="lg" variant="secondary">
                  Начать сейчас
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </MainLayout>
    </>
  )
}
