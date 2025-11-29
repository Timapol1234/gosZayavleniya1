'use client'

import { InputHTMLAttributes, forwardRef, useId } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: string
  rightIcon?: string
  icon?: string // Alias for leftIcon for backwards compatibility
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      icon,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const inputId = id || generatedId
    const actualLeftIcon = leftIcon || icon // Use icon as fallback for leftIcon

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-text-primary"
          >
            {label}
            {props.required && <span className="ml-1 text-error">*</span>}
          </label>
        )}

        <div className="relative">
          {actualLeftIcon && (
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
              {actualLeftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'input-field',
              actualLeftIcon && 'pl-11',
              rightIcon && 'pr-11',
              error && 'border-error focus:border-error focus:ring-error/20',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
              {rightIcon}
            </span>
          )}
        </div>

        {error && <p className="mt-1 text-sm text-error">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-text-secondary">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
