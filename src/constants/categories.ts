export const CATEGORIES = [
  {
    name: 'МФЦ и госуслуги',
    slug: 'mfc-gosuslugi',
    icon: 'account_balance',
    description: 'Заявления в МФЦ, получение документов',
    order: 1,
  },
  {
    name: 'Суды',
    slug: 'courts',
    icon: 'gavel',
    description: 'Исковые заявления, жалобы в суд',
    order: 2,
  },
  {
    name: 'Банки',
    slug: 'banks',
    icon: 'account_balance_wallet',
    description: 'Претензии в банк, возврат средств',
    order: 3,
  },
  {
    name: 'ФНС',
    slug: 'fns',
    icon: 'receipt_long',
    description: 'Налоговые вычеты, регистрация ИП',
    order: 4,
  },
  {
    name: 'Работодатели',
    slug: 'employers',
    icon: 'work',
    description: 'Заявления на отпуск, увольнение',
    order: 5,
  },
  {
    name: 'Другие организации',
    slug: 'other',
    icon: 'business',
    description: 'ЖКХ, образование, здравоохранение',
    order: 6,
  },
] as const
