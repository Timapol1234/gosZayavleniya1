'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Button from './Button'

export default function CookieNotice() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Проверяем, принял ли пользователь cookie политику
    const cookieConsent = localStorage.getItem('cookieConsent')
    if (!cookieConsent) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted')
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              Мы используем cookie-файлы для улучшения работы сайта, аналитики и
              персонализации. Продолжая использовать наш сайт, вы соглашаетесь с
              нашей{' '}
              <Link
                href="/privacy"
                className="text-primary underline hover:text-blue-700"
              >
                Политикой конфиденциальности
              </Link>{' '}
              и использованием cookie.
            </p>
          </div>
          <div className="flex gap-3 sm:flex-shrink-0">
            <Button
              variant="outline"
              onClick={handleDecline}
              className="text-sm"
            >
              Отклонить
            </Button>
            <Button onClick={handleAccept} className="text-sm">
              Принять
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
