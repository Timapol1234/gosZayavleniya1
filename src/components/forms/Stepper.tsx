'use client'

import { cn } from '@/lib/utils'

export interface Step {
  number: number
  title: string
  isCompleted: boolean
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (stepNumber: number) => void
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="space-y-2">
      {steps.map((step, index) => {
        const isActive = step.number === currentStep
        const isClickable = step.isCompleted && onStepClick
        const isAccessible = step.number <= currentStep || step.isCompleted

        return (
          <div
            key={step.number}
            className={cn(
              'flex items-start gap-3 rounded-lg p-3 transition-colors',
              isActive && 'bg-primary/10',
              isClickable && 'cursor-pointer hover:bg-gray-100',
              !isAccessible && 'opacity-50'
            )}
            onClick={() => isClickable && onStepClick(step.number)}
          >
            {/* Шаг номер */}
            <div
              className={cn(
                'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium',
                isActive && 'bg-primary text-white',
                step.isCompleted && !isActive && 'bg-green-500 text-white',
                !isActive && !step.isCompleted && 'bg-gray-200 text-gray-600'
              )}
            >
              {step.isCompleted && !isActive ? (
                <span className="material-symbols-outlined text-lg">
                  check
                </span>
              ) : (
                step.number
              )}
            </div>

            {/* Шаг информация */}
            <div className="flex-1 pt-0.5">
              <p
                className={cn(
                  'text-sm font-medium',
                  isActive && 'text-primary',
                  !isActive && 'text-gray-700'
                )}
              >
                {step.title}
              </p>
            </div>

            {/* Линия между шагами */}
            {index < steps.length - 1 && (
              <div className="absolute left-7 top-12 h-8 w-0.5 bg-gray-200" />
            )}
          </div>
        )
      })}
    </div>
  )
}
