'use client'

import { useState } from 'react'
import Checkbox from '@/components/ui/Checkbox'
import Card from '@/components/ui/Card'

interface ChecklistItem {
  id: string
  label: string
  checked: boolean
}

interface DataChecklistProps {
  missingFields?: string[]
}

export function DataChecklist({ missingFields = [] }: DataChecklistProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: 'personal-data',
      label: 'Проверены личные данные',
      checked: false,
    },
    {
      id: 'dates',
      label: 'Проверены все даты',
      checked: false,
    },
    {
      id: 'amounts',
      label: 'Проверены суммы и числа',
      checked: false,
    },
    {
      id: 'spelling',
      label: 'Проверена орфография',
      checked: false,
    },
    {
      id: 'completeness',
      label: 'Все поля заполнены',
      checked: missingFields.length === 0,
    },
  ])

  const handleCheckChange = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    )
  }

  const allChecked = checklist.every((item) => item.checked)
  const checkedCount = checklist.filter((item) => item.checked).length

  return (
    <Card>
      <div className="p-4">
        <h3 className="mb-4 text-lg font-semibold">Проверка данных</h3>

        {/* Прогресс */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Проверено {checkedCount} из {checklist.length}
            </span>
            <span className="font-medium text-primary">
              {Math.round((checkedCount / checklist.length) * 100)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{
                width: `${(checkedCount / checklist.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Предупреждение о незаполненных полях */}
        {missingFields.length > 0 && (
          <div className="mb-4 rounded-lg bg-warning/10 p-3">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-warning">
                warning
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-warning">
                  Не все поля заполнены
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  Отсутствуют: {missingFields.join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Чеклист */}
        <div className="space-y-3">
          {checklist.map((item) => (
            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
            >
              <Checkbox
                checked={item.checked}
                onChange={() => handleCheckChange(item.id)}
                disabled={item.id === 'completeness' && missingFields.length > 0}
              />
              <span className="flex-1 text-sm text-gray-700">{item.label}</span>
            </label>
          ))}
        </div>

        {/* Статус */}
        {allChecked && (
          <div className="mt-4 rounded-lg bg-success/10 p-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-success">
                check_circle
              </span>
              <p className="text-sm font-medium text-success">
                Все проверки пройдены
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
