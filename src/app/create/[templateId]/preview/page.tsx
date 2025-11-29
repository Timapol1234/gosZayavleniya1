'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { DocumentPreview } from '@/components/documents/DocumentPreview'
import { DataChecklist } from '@/components/documents/DataChecklist'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import MainLayout from '@/components/layout/MainLayout'
import { validateTemplateData } from '@/lib/templateRenderer'
import { downloadPDF } from '@/lib/pdfGenerator'

interface Document {
  id: string
  title: string
  filledData: string
  template: {
    id: string
    title: string
    contentJson: {
      html: string
    }
  }
}

export default function PreviewPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  const templateId = params.templateId as string
  const documentId = searchParams.get('documentId')

  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [editableContent, setEditableContent] = useState<string | null>(null)
  const documentRef = useRef<HTMLDivElement>(null)

  // Редирект на логин если не авторизован
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Загрузка документа
  useEffect(() => {
    const fetchDocument = async () => {
      // Проверяем что documentId существует и не null/undefined
      if (!documentId || documentId === 'null' || !session) {
        setIsLoading(false)
        return
      }

      try {
        const response = await axios.get(`/api/documents/${documentId}`)
        setDocument(response.data)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching document:', error)
        setIsLoading(false)
      }
    }

    fetchDocument()
  }, [documentId, session])

  if (status === 'loading' || isLoading) {
    return (
      <MainLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">
              progress_activity
            </span>
            <p className="mt-4 text-gray-600">Загрузка документа...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!document) {
    return (
      <MainLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-gray-300">
              description
            </span>
            <p className="mt-4 text-xl text-gray-600">Документ не найден</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const filledData = JSON.parse(document.filledData || '{}')

  // Парсим contentJson если это строка (SQLite хранит JSON как строку)
  const contentJson = typeof document.template.contentJson === 'string'
    ? JSON.parse(document.template.contentJson)
    : document.template.contentJson

  const htmlTemplate = contentJson?.html || ''

  // Валидация данных
  const validation = validateTemplateData(htmlTemplate, filledData)

  // Обработчики
  const handleGeneratePDF = async () => {
    if (!documentRef.current) return

    setIsGenerating(true)
    try {
      const filename = `${document.title.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}.pdf`
      await downloadPDF(documentRef.current, filename)

      // Обновляем статус документа
      await axios.patch(`/api/documents/${document.id}`, {
        status: 'generated',
      })
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Ошибка при генерации PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleBackToEdit = () => {
    router.push(`/create/${templateId}`)
  }

  const handleGosuslugi = () => {
    alert('Интеграция с Госуслугами будет доступна в следующей версии')
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Заголовок */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Предпросмотр документа
          </h1>
          <p className="mt-1 text-gray-600">{document.title}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Боковая панель */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {/* Чеклист */}
              <DataChecklist missingFields={validation.missingVariables} />

              {/* Кнопки действий */}
              <Card>
                <div className="space-y-3 p-4">
                  <Button
                    className="w-full"
                    onClick={handleGeneratePDF}
                    isLoading={isGenerating}
                    disabled={!validation.isValid}
                  >
                    <span className="material-symbols-outlined mr-2">
                      download
                    </span>
                    Скачать PDF
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleBackToEdit}
                  >
                    <span className="material-symbols-outlined mr-2">
                      edit
                    </span>
                    Вернуться к редактированию
                  </Button>

                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleGosuslugi}
                    disabled
                  >
                    <span className="material-symbols-outlined mr-2">
                      send
                    </span>
                    Отправить через Госуслуги
                  </Button>

                  {!validation.isValid && (
                    <p className="text-xs text-warning">
                      Заполните все обязательные поля перед генерацией PDF
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Предпросмотр документа */}
          <div className="lg:col-span-3">
            <div ref={documentRef}>
              <DocumentPreview
                htmlTemplate={htmlTemplate}
                filledData={filledData}
                editable={true}
                onContentChange={setEditableContent}
              />
            </div>
            <p className="mt-2 text-center text-sm text-gray-500">
              Кликните на текст, чтобы отредактировать
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
