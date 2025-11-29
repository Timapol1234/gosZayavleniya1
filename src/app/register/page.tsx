'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Пароль должен быть не менее 6 символов')
      return
    }

    // Validate terms agreement
    if (!agreedToTerms) {
      setError('Необходимо согласиться с условиями использования')
      return
    }

    setLoading(true)

    try {
      // Register user
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Ошибка при регистрации')
        return
      }

      // Auto login after registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Регистрация успешна, но не удалось войти')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Произошла ошибка при регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="container-custom py-16">
        <div className="mx-auto max-w-md">
          <Card>
            <div className="mb-6 text-center">
              <h1 className="mb-2 text-2xl font-bold text-text-primary">
                Регистрация
              </h1>
              <p className="text-sm text-text-secondary">
                Создайте аккаунт, чтобы начать работу
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Имя (необязательно)
                </label>
                <Input
                  type="text"
                  name="name"
                  placeholder="Иван Иванов"
                  value={formData.name}
                  onChange={handleChange}
                  icon="person"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  placeholder="example@mail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  icon="mail"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Пароль
                </label>
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  icon="lock"
                />
                <p className="mt-1 text-xs text-text-secondary">
                  Минимум 6 символов
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Подтвердите пароль
                </label>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  icon="lock"
                />
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <label htmlFor="terms" className="text-sm text-text-secondary">
                  Я принимаю{' '}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-primary hover:underline"
                  >
                    Пользовательское соглашение
                  </Link>{' '}
                  и{' '}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-primary hover:underline"
                  >
                    Политику конфиденциальности
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-text-secondary">
              Уже есть аккаунт?{' '}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Войти
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
