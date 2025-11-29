'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { Template, FormField } from '@/types/template'
import { Stepper, Step } from '@/components/forms/Stepper'
import { ProgressBar } from '@/components/forms/ProgressBar'
import { DynamicFormField } from '@/components/forms/DynamicFormField'
import { SaveIndicator } from '@/components/forms/SaveIndicator'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import MainLayout from '@/components/layout/MainLayout'

type SaveStatus = 'saved' | 'saving' | 'error'

export default function CreateDocumentPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const templateId = params.templateId as string

  const [template, setTemplate] = useState<Template | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const [isLoading, setIsLoading] = useState(true)
  const [steps, setSteps] = useState<Step[]>([])

  // Редирект на логин если не авторизован
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Загрузка шаблона
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await axios.get(`/api/templates/${templateId}`)
        setTemplate(response.data)

        // Группируем поля по шагам
        const formFields = response.data.formFields || []
        const maxStep = Math.max(...formFields.map((f: FormField) => f.stepNumber))

        // Создаем массив шагов
        const stepsData: Step[] = []
        for (let i = 1; i <= maxStep; i++) {
          const stepFields = formFields.filter((f: FormField) => f.stepNumber === i)
          if (stepFields.length > 0) {
            stepsData.push({
              number: i,
              title: `Шаг ${i}`,
              isCompleted: false,
            })
          }
        }
        setSteps(stepsData)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching template:', error)
        setIsLoading(false)
      }
    }

    if (templateId && session) {
      fetchTemplate()
    }
  }, [templateId, session])

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
    trigger,
  } = useForm()

  const saveDocument = async (data?: any) => {
    try {
      setSaveStatus('saving')
      const dataToSave = data || getValues()

      if (documentId) {
        // Обновляем существующий черновик
        await axios.patch(`/api/documents/${documentId}`, {
          filledData: dataToSave,
        })
      } else {
        // Создаем новый черновик
        const response = await axios.post('/api/documents', {
          templateId,
          title: template?.title,
          filledData: dataToSave,
        })
        setDocumentId(response.data.id)
      }

      setSaveStatus('saved')
    } catch (error) {
      console.error('Error saving document:', error)
      setSaveStatus('error')
    }
  }

  // Автосохранение каждые 10 минут (только если есть данные)
  useEffect(() => {
    if (!template) return

    const intervalId = setInterval(() => {
      const currentData = getValues()
      if (Object.keys(currentData).length > 0) {
        saveDocument(currentData)
      }
    }, 600000) // 10 минут = 600000 мс

    return () => clearInterval(intervalId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template?.id]) // Зависимость только от template.id для стабильности

  // Получаем поля текущего шага
  const getCurrentStepFields = (): FormField[] => {
    if (!template?.formFields) return []
    return template.formFields
      .filter((field) => field.stepNumber === currentStep)
      .sort((a, b) => a.order - b.order)
  }

  // Навигация между шагами
  const handleNext = async () => {
    const currentFields = getCurrentStepFields()
    const fieldNames = currentFields.map((f) => f.fieldName)

    // Валидируем текущий шаг
    const isValid = await trigger(fieldNames)

    if (isValid) {
      // Отмечаем текущий шаг как завершенный
      setSteps((prev) =>
        prev.map((step) =>
          step.number === currentStep ? { ...step, isCompleted: true } : step
        )
      )

      // Сохраняем данные перед переходом
      await saveDocument()

      // Переходим к следующему шагу
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1)
      } else {
        // Последний шаг - переходим к предпросмотру
        // Проверяем что документ создан перед переходом
        if (!documentId) {
          alert('Ошибка: документ не был сохранен. Попробуйте еще раз.')
          return
        }
        router.push(`/create/${templateId}/preview?documentId=${documentId}`)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (stepNumber: number) => {
    setCurrentStep(stepNumber)
  }

  if (status === 'loading' || isLoading) {
    return (
      <MainLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">
              progress_activity
            </span>
            <p className="mt-4 text-gray-600">Загрузка шаблона...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!template) {
    return (
      <MainLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-gray-300">
              description
            </span>
            <p className="mt-4 text-xl text-gray-600">Шаблон не найден</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const currentStepFields = getCurrentStepFields()

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Заголовок */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{template.title}</h1>
          <p className="mt-1 text-gray-600">{template.description}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Боковая панель с шагами */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <div className="p-4">
                <h2 className="mb-4 text-lg font-semibold">Шаги заполнения</h2>
                <ProgressBar current={currentStep} total={steps.length} className="mb-6" />
                <Stepper
                  steps={steps}
                  currentStep={currentStep}
                  onStepClick={handleStepClick}
                />
              </div>
            </Card>
          </div>

          {/* Основная форма */}
          <div className="lg:col-span-3">
            <Card>
              <div className="p-6">
                {/* Индикатор сохранения */}
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    Шаг {currentStep}: Заполните данные
                  </h2>
                  <SaveIndicator status={saveStatus} />
                </div>

                {/* Поля формы */}
                <form onSubmit={handleSubmit(handleNext)} className="space-y-6">
                  {currentStepFields.map((field) => (
                    <DynamicFormField
                      key={field.id}
                      field={field}
                      register={register}
                      errors={errors}
                    />
                  ))}

                  {/* Навигация */}
                  <div className="flex items-center justify-between border-t pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 1}
                    >
                      <span className="material-symbols-outlined mr-2">
                        arrow_back
                      </span>
                      Назад
                    </Button>

                    <Button type="submit">
                      {currentStep === steps.length ? (
                        <>
                          Далее к предпросмотру
                          <span className="material-symbols-outlined ml-2">
                            visibility
                          </span>
                        </>
                      ) : (
                        <>
                          Далее
                          <span className="material-symbols-outlined ml-2">
                            arrow_forward
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
