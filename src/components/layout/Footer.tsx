import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: {
      title: 'Продукт',
      links: [
        { name: 'Шаблоны', href: '/templates' },
        { name: 'Как это работает', href: '#how-it-works' },
        { name: 'Цены', href: '#pricing' },
      ],
    },
    company: {
      title: 'Компания',
      links: [
        { name: 'О нас', href: '/about' },
        { name: 'Контакты', href: '/contacts' },
        { name: 'Блог', href: '/blog' },
      ],
    },
    legal: {
      title: 'Правовая информация',
      links: [
        { name: 'Пользовательское соглашение', href: '/terms' },
        { name: 'Политика конфиденциальности', href: '/privacy' },
        { name: 'Отказ от ответственности', href: '/disclaimer' },
      ],
    },
    support: {
      title: 'Поддержка',
      links: [
        { name: 'FAQ', href: '/faq' },
        { name: 'Помощь', href: '/help' },
        { name: 'Обратная связь', href: '/feedback' },
      ],
    },
  }

  return (
    <footer className="border-t border-border-gray bg-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2">
              <span className="material-symbols-outlined text-3xl text-primary">
                description
              </span>
              <span className="text-xl font-bold text-text-primary">
                ГосЗаявления
              </span>
            </div>
            <p className="mt-4 text-sm text-text-secondary">
              Создавайте юридически корректные заявления за несколько минут
            </p>
            <div className="mt-6 flex space-x-4">
              <a
                href="https://vk.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary transition-colors hover:text-primary"
              >
                <span className="text-2xl">VK</span>
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary transition-colors hover:text-primary"
              >
                <span className="text-2xl">TG</span>
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="mb-4 text-sm font-semibold text-text-primary">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary transition-colors hover:text-primary"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-border-gray pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-sm text-text-secondary">
              © {currentYear} ГосЗаявления. Все права защищены.
            </p>
            <p className="text-sm text-text-secondary">
              Сделано с помощью Next.js и TailwindCSS
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
