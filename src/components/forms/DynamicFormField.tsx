'use client'

import { FormField } from '@/types/template'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { UseFormRegister, FieldErrors } from 'react-hook-form'

interface DynamicFormFieldProps {
  field: FormField
  register: UseFormRegister<any>
  errors: FieldErrors
}

export function DynamicFormField({
  field,
  register,
  errors,
}: DynamicFormFieldProps) {
  const error = errors[field.fieldName]
  const errorMessage = error?.message as string | undefined

  // Базовые правила валидации из FormField
  const validationRules = {
    required: field.isRequired ? `${field.label} обязательно для заполнения` : false,
    ...field.validationRules,
  }

  switch (field.fieldType) {
    case 'text':
      return (
        <div className="space-y-1">
          <Input
            label={field.label}
            placeholder={field.placeholder}
            error={errorMessage}
            required={field.isRequired}
            {...register(field.fieldName, validationRules)}
          />
        </div>
      )

    case 'number':
      return (
        <div className="space-y-1">
          <Input
            type="number"
            label={field.label}
            placeholder={field.placeholder}
            error={errorMessage}
            required={field.isRequired}
            {...register(field.fieldName, {
              ...validationRules,
              valueAsNumber: true,
            })}
          />
        </div>
      )

    case 'date':
      return (
        <div className="space-y-1">
          <Input
            type="date"
            label={field.label}
            placeholder={field.placeholder}
            error={errorMessage}
            required={field.isRequired}
            {...register(field.fieldName, validationRules)}
          />
        </div>
      )

    case 'select':
      return (
        <div className="space-y-1">
          <Select
            label={field.label}
            options={
              field.options?.map((option) => ({
                value: option,
                label: option,
              })) || []
            }
            error={errorMessage}
            required={field.isRequired}
            {...register(field.fieldName, validationRules)}
          />
        </div>
      )

    case 'textarea':
      return (
        <div className="space-y-1">
          <Textarea
            label={field.label}
            placeholder={field.placeholder}
            error={errorMessage}
            required={field.isRequired}
            rows={4}
            {...register(field.fieldName, validationRules)}
          />
        </div>
      )

    default:
      return null
  }
}
