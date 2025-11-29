'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default function Header() {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  const navigation = [
    { name: 'Главная', href: '/' },
    { name: 'Шаблоны', href: '/templates' },
    ...(session ? [{ name: 'Мои документы', href: '/dashboard' }] : []),
  ]

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border-gray bg-white shadow-sm">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-3xl text-primary">
              description
            </span>
            <span className="text-xl font-bold text-text-primary">
              ГосЗаявления
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href
                    ? 'text-primary'
                    : 'text-text-secondary'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="h-8 w-20 animate-pulse rounded bg-gray-200"></div>
            ) : session ? (
              <>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className="material-symbols-outlined text-primary">
                    account_circle
                  </span>
                  <span className="hidden md:inline">{session.user?.name || session.user?.email}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Войти
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Регистрация
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden">
            <span className="material-symbols-outlined text-text-primary">
              menu
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
