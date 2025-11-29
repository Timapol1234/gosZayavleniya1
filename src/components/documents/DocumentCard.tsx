'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { formatDate } from '@/lib/utils'

interface Document {
  id: string
  title: string
  status: 'draft' | 'generated'
  createdAt: string
  updatedAt: string
  template: {
    id: number
    title: string
    category: {
      name: string
    }
  }
  pdfUrl?: string | null
}

interface DocumentCardProps {
  document: Document
  onDelete: (id: string) => void
}

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const statusConfig = {
    draft: {
      label: 'Черновик',
      variant: 'warning' as const,
    },
    generated: {
      label: 'Сгенерирован',
      variant: 'success' as const,
    },
  }

  const handleEdit = () => {
    router.push(`/create/${document.template.id}?documentId=${document.id}`)
  }

  const handlePreview = () => {
    router.push(`/create/${document.template.id}/preview?documentId=${document.id}`)
  }

  const handleDownload = () => {
    if (document.pdfUrl) {
      window.open(document.pdfUrl, '_blank')
    } else {
      // Если PDF еще не сгенерирован, переходим к предпросмотру
      handlePreview()
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await axios.delete(`/api/documents/${document.id}`)
      onDelete(document.id)
      setShowDeleteModal(false)
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Ошибка при удалении документа')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card className="transition-shadow hover:shadow-md">
        <div className="p-6">
          {/* Заголовок и статус */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <h3 className="mb-1 text-lg font-semibold text-gray-900">
                {document.title}
              </h3>
              <p className="text-sm text-gray-500">
                {document.template?.category?.name || 'Без категории'} • {document.template.title}
              </p>
            </div>
            <Badge variant={statusConfig[document.status].variant}>
              {statusConfig[document.status].label}
            </Badge>
          </div>

          {/* Даты */}
          <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base">
                calendar_today
              </span>
              <span>Создан: {formatDate(document.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base">
                update
              </span>
              <span>Изменен: {formatDate(document.updatedAt)}</span>
            </div>
          </div>

          {/* Действия */}
          <div className="flex items-center gap-2">
            {document.status === 'draft' ? (
              <Button
                size="sm"
                onClick={handleEdit}
                className="flex-1"
              >
                <span className="material-symbols-outlined mr-2 text-base">
                  edit
                </span>
                Продолжить редактирование
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={handleDownload}
                  className="flex-1"
                >
                  <span className="material-symbols-outlined mr-2 text-base">
                    download
                  </span>
                  Скачать PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePreview}
                >
                  <span className="material-symbols-outlined text-base">
                    visibility
                  </span>
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDeleteModal(true)}
            >
              <span className="material-symbols-outlined text-base">
                delete
              </span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Модальное окно подтверждения удаления */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Удалить документ?"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Вы уверены, что хотите удалить документ "{document.title}"? Это
            действие нельзя отменить.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Отмена
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Удалить
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
