'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'

interface Metrics {
  overview: {
    totalUsers: number
    totalDocuments: number
    recentUsers: number
    recentDocuments: number
  }
  documentsByStatus: Array<{
    status: string
    count: number
  }>
  popularTemplates: Array<{
    templateId: number
    templateTitle: string
    count: number
  }>
  documentsPerDay: Array<{
    date: string
    count: number
  }>
}

export default function MetricsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchMetrics()
    }
  }, [status, router])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/metrics')

      if (!response.ok) {
        throw new Error('Failed to fetch metrics')
      }

      const data = await response.json()
      setMetrics(data)
    } catch (err) {
      setError('Не удалось загрузить метрики')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <MainLayout>
        <div className="container-custom py-12">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">
            Метрики и аналитика
          </h1>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <Skeleton className="h-24 w-full" />
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container-custom py-12">
          <div className="rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!metrics) {
    return null
  }

  const statusLabels: Record<string, string> = {
    draft: 'Черновик',
    generated: 'Сгенерирован',
  }

  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Метрики и аналитика
          </h1>
          <button
            onClick={fetchMetrics}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-blue-700"
          >
            <span className="material-symbols-outlined text-xl">refresh</span>
            Обновить
          </button>
        </div>

        {/* Overview Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <span className="material-symbols-outlined text-2xl text-primary">
                  group
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Всего пользователей</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.overview.totalUsers}
                </p>
                <p className="text-xs text-green-600">
                  +{metrics.overview.recentUsers} за неделю
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <span className="material-symbols-outlined text-2xl text-green-600">
                  description
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Всего документов</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.overview.totalDocuments}
                </p>
                <p className="text-xs text-green-600">
                  +{metrics.overview.recentDocuments} за неделю
                </p>
              </div>
            </div>
          </Card>

          {metrics.documentsByStatus.map((item) => (
            <Card key={item.status}>
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-purple-100 p-3">
                  <span className="material-symbols-outlined text-2xl text-purple-600">
                    {item.status === 'draft' ? 'edit_document' : 'check_circle'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {statusLabels[item.status] || item.status}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {item.count}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Popular Templates */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Популярные шаблоны
          </h2>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 text-left text-sm font-semibold text-gray-700">
                      #
                    </th>
                    <th className="pb-3 text-left text-sm font-semibold text-gray-700">
                      Название шаблона
                    </th>
                    <th className="pb-3 text-right text-sm font-semibold text-gray-700">
                      Использований
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.popularTemplates.map((template, index) => (
                    <tr
                      key={template.templateId}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="py-3 text-sm text-gray-600">
                        {index + 1}
                      </td>
                      <td className="py-3 text-sm text-gray-900">
                        {template.templateTitle}
                      </td>
                      <td className="py-3 text-right text-sm font-semibold text-gray-900">
                        {template.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Documents per Day Chart */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Документы по дням (последние 30 дней)
          </h2>
          <Card>
            <div className="space-y-2">
              {metrics.documentsPerDay.length === 0 ? (
                <p className="text-center text-gray-500">Нет данных</p>
              ) : (
                metrics.documentsPerDay.map((item) => (
                  <div
                    key={item.date}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600">
                      {new Date(item.date).toLocaleDateString('ru-RU')}
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 rounded bg-primary"
                        style={{
                          width: `${Math.max((item.count / Math.max(...metrics.documentsPerDay.map((d) => d.count))) * 200, 20)}px`,
                        }}
                      />
                      <span className="text-sm font-semibold text-gray-900">
                        {item.count}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
