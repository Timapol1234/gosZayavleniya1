import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Template factory helper
function createTemplate(
  title: string,
  description: string,
  categorySlug: string,
  tags: string,
  applicantType: 'physical' | 'legal' | 'both',
  htmlContent: string,
  fields: any[],
  categories: any[]
) {
  return {
    title,
    description,
    categoryId: categories.find((c) => c.slug === categorySlug)!.id,
    applicantType,
    tags,
    contentJson: JSON.stringify({ html: htmlContent }),
    formFields: { create: fields },
  }
}

// Common field sets
const basicFields = (step: number = 1) => [
  {
    fieldName: 'fullName',
    label: 'ФИО полностью',
    fieldType: 'text',
    placeholder: 'Иванов Иван Иванович',
    required: true,
    stepNumber: step,
    order: 1,
    validationRules: JSON.stringify({ minLength: 3 }),
  },
  {
    fieldName: 'birthDate',
    label: 'Дата рождения',
    fieldType: 'date',
    required: true,
    stepNumber: step,
    order: 2,
    validationRules: JSON.stringify({}),
  },
  {
    fieldName: 'passport',
    label: 'Паспорт (серия и номер)',
    fieldType: 'text',
    placeholder: '1234 567890',
    required: true,
    stepNumber: step,
    order: 3,
    validationRules: JSON.stringify({}),
  },
  {
    fieldName: 'address',
    label: 'Адрес регистрации',
    fieldType: 'textarea',
    placeholder: 'г. Москва, ул. Ленина, д. 1, кв. 1',
    required: true,
    stepNumber: step,
    order: 4,
    validationRules: JSON.stringify({}),
  },
  {
    fieldName: 'phone',
    label: 'Контактный телефон',
    fieldType: 'text',
    placeholder: '+7 (999) 123-45-67',
    required: true,
    stepNumber: step,
    order: 5,
    validationRules: JSON.stringify({}),
  },
]

const standardDocumentHtml = (title: string, content: string) => `
<div style="font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.5;">
  <div style="text-align: right; margin-bottom: 20px;">
    {{recipient}}<br/>
    от {{fullName}}<br/>
    {{address}}<br/>
    Телефон: {{phone}}
  </div>
  <h2 style="text-align: center; font-size: 16pt; font-weight: bold; margin: 30px 0;">
    ${title}
  </h2>
  ${content}
  <p style="margin-top: 40px;">
    Дата: __________<br/>
    Подпись: __________ {{fullName}}
  </p>
</div>`

async function main() {
  console.log('🌱 Начинаем заполнение базы данных расширенными шаблонами...')

  // Очистка
  await prisma.document.deleteMany()
  await prisma.formField.deleteMany()
  await prisma.template.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  // Создание категорий
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'МФЦ и госуслуги',
        slug: 'mfc-gosuslugi',
        icon: 'account_balance',
        description: 'Заявления в МФЦ, получение документов',
        order: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Суды',
        slug: 'courts',
        icon: 'gavel',
        description: 'Исковые заявления, жалобы в суд',
        order: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Банки',
        slug: 'banks',
        icon: 'account_balance_wallet',
        description: 'Претензии в банк, возврат средств',
        order: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'ФНС',
        slug: 'fns',
        icon: 'receipt_long',
        description: 'Налоговые вычеты, регистрация ИП',
        order: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Работодатели',
        slug: 'employers',
        icon: 'work',
        description: 'Заявления на отпуск, увольнение',
        order: 5,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Другие организации',
        slug: 'other',
        icon: 'business',
        description: 'ЖКХ, образование, здравоохранение',
        order: 6,
      },
    }),
  ])

  console.log('✅ Категории созданы')

  // Тестовый пользователь
  const hashedPassword = await bcrypt.hash('password123', 10)
  await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Тестовый пользователь',
      passwordHash: hashedPassword,
    },
  })

  console.log('✅ Пользователь создан')

  // Создание всех шаблонов
  const templatesData = [
    // === МФЦ ===
    {
      ...createTemplate(
        'Заявление на получение паспорта РФ',
        'Получение или замена паспорта гражданина РФ',
        'mfc-gosuslugi',
        'паспорт,замена паспорта,мфц',
        'physical',
        standardDocumentHtml(
          'ЗАЯВЛЕНИЕ<br/>о выдаче (замене) паспорта',
          `<p>Прошу выдать (заменить) паспорт гражданина РФ в связи с {{reason}}.</p>
          <p>Мои данные:</p>
          <ul>
            <li>ФИО: {{fullName}}</li>
            <li>Дата рождения: {{birthDate}}</li>
            <li>Паспорт: {{passport}}</li>
            <li>Адрес: {{address}}</li>
          </ul>`
        ),
        [
          ...basicFields(1),
          {
            fieldName: 'recipient',
            label: 'Куда подается',
            fieldType: 'text',
            placeholder: 'Отделение УФМС',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'reason',
            label: 'Причина замены',
            fieldType: 'select',
            options:
              'достижением 20-летнего возраста,достижением 45-летнего возраста,непригодностью,изменением данных',
            required: true,
            stepNumber: 2,
            order: 2,
            validationRules: JSON.stringify({}),
          },
        ],
        categories
      ),
    },
    {
      ...createTemplate(
        'Заявление на регистрацию по месту жительства',
        'Постановка на регистрационный учет (прописка)',
        'mfc-gosuslugi',
        'прописка,регистрация,мфц',
        'physical',
        standardDocumentHtml(
          'ЗАЯВЛЕНИЕ<br/>о регистрации по месту жительства',
          `<p>Прошу зарегистрировать меня по адресу: {{newAddress}}.</p>
          <p>Основание: {{basis}}</p>`
        ),
        [
          ...basicFields(1),
          {
            fieldName: 'recipient',
            label: 'Куда подается',
            fieldType: 'text',
            placeholder: 'МФЦ',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'newAddress',
            label: 'Новый адрес',
            fieldType: 'textarea',
            required: true,
            stepNumber: 2,
            order: 2,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'basis',
            label: 'Основание',
            fieldType: 'select',
            options: 'право собственности,договор найма,согласие собственника',
            required: true,
            stepNumber: 2,
            order: 3,
            validationRules: JSON.stringify({}),
          },
        ],
        categories
      ),
    },
    {
      ...createTemplate(
        'Заявление на получение ИНН',
        'Получение идентификационного номера налогоплательщика',
        'mfc-gosuslugi',
        'инн,налоговая,мфц',
        'physical',
        standardDocumentHtml(
          'ЗАЯВЛЕНИЕ<br/>о постановке на учет физического лица',
          `<p>Прошу поставить меня на учет в налоговом органе и присвоить ИНН.</p>`
        ),
        basicFields(1).concat([
          {
            fieldName: 'recipient',
            label: 'Налоговая инспекция',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
        ]),
        categories
      ),
    },
    {
      ...createTemplate(
        'Заявление на получение СНИЛС',
        'Получение страхового номера индивидуального лицевого счета',
        'mfc-gosuslugi',
        'снилс,пенсионный фонд,мфц',
        'physical',
        standardDocumentHtml(
          'ЗАЯВЛЕНИЕ<br/>о регистрации в системе ОПС',
          `<p>Прошу зарегистрировать меня в системе обязательного пенсионного страхования.</p>`
        ),
        basicFields(1).concat([
          {
            fieldName: 'recipient',
            label: 'Отделение ПФР',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
        ]),
        categories
      ),
    },
    {
      ...createTemplate(
        'Заявление на замену водительского удостоверения',
        'Замена водительского удостоверения по истечении срока или при смене данных',
        'mfc-gosuslugi',
        'водительские права,замена прав,гибдд',
        'physical',
        standardDocumentHtml(
          'ЗАЯВЛЕНИЕ<br/>о замене водительского удостоверения',
          `<p>Прошу заменить водительское удостоверение в связи с {{reason}}.</p>
          <p>Данные старого ВУ: серия {{oldLicenseSeries}}, номер {{oldLicenseNumber}}</p>`
        ),
        [
          ...basicFields(1),
          {
            fieldName: 'recipient',
            label: 'Подразделение ГИБДД',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'reason',
            label: 'Причина замены',
            fieldType: 'select',
            options:
              'истечением срока действия,изменением персональных данных,утратой,непригодностью',
            required: true,
            stepNumber: 2,
            order: 2,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'oldLicenseSeries',
            label: 'Серия старого ВУ',
            fieldType: 'text',
            required: false,
            stepNumber: 2,
            order: 3,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'oldLicenseNumber',
            label: 'Номер старого ВУ',
            fieldType: 'text',
            required: false,
            stepNumber: 2,
            order: 4,
            validationRules: JSON.stringify({}),
          },
        ],
        categories
      ),
    },

    // === СУДЫ ===
    {
      ...createTemplate(
        'Исковое заявление о расторжении брака',
        'Заявление о расторжении брака в судебном порядке',
        'courts',
        'развод,расторжение брака,суд',
        'physical',
        standardDocumentHtml(
          'ИСКОВОЕ ЗАЯВЛЕНИЕ<br/>о расторжении брака',
          `<p>Брак с {{spouseName}} (дата рождения {{spouseBirthDate}}) был зарегистрирован {{marriageDate}} в {{marriagePlace}}.</p>
          <p>Совместная жизнь не сложилась по причине: {{reason}}.</p>
          <p>От брака имеются несовершеннолетние дети: {{children}}</p>
          <p>На основании изложенного, руководствуясь ст. 21-23 Семейного кодекса РФ,</p>
          <p><strong>ПРОШУ:</strong></p>
          <p>Расторгнуть брак между мной и {{spouseName}}.</p>`
        ),
        [
          ...basicFields(1),
          {
            fieldName: 'recipient',
            label: 'Наименование суда',
            fieldType: 'text',
            placeholder: 'Басманный районный суд г. Москвы',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'spouseName',
            label: 'ФИО супруга(и)',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 2,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'spouseBirthDate',
            label: 'Дата рождения супруга(и)',
            fieldType: 'date',
            required: true,
            stepNumber: 2,
            order: 3,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'marriageDate',
            label: 'Дата регистрации брака',
            fieldType: 'date',
            required: true,
            stepNumber: 2,
            order: 4,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'marriagePlace',
            label: 'Место регистрации брака',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 5,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'reason',
            label: 'Причина расторжения',
            fieldType: 'textarea',
            required: true,
            stepNumber: 3,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'children',
            label: 'Дети (ФИО и даты рождения)',
            fieldType: 'textarea',
            placeholder: 'Иванов Петр Иванович, 01.01.2015',
            required: false,
            stepNumber: 3,
            order: 2,
            validationRules: JSON.stringify({}),
          },
        ],
        categories
      ),
    },
    {
      ...createTemplate(
        'Исковое заявление о взыскании долга',
        'Взыскание задолженности по договору займа или кредита',
        'courts',
        'взыскание долга,долг,заем,суд',
        'both',
        standardDocumentHtml(
          'ИСКОВОЕ ЗАЯВЛЕНИЕ<br/>о взыскании задолженности',
          `<p>{{debtorName}} (адрес: {{debtorAddress}}) имеет передо мной задолженность в размере {{debtAmount}} руб.</p>
          <p>Основание возникновения долга: {{debtBasis}}.</p>
          <p>Срок возврата: {{debtDeadline}}. Долг не возвращен до настоящего времени.</p>
          <p>На основании изложенного, руководствуясь ст. 807-811 ГК РФ,</p>
          <p><strong>ПРОШУ:</strong></p>
          <ol>
            <li>Взыскать с {{debtorName}} в мою пользу сумму долга {{debtAmount}} руб.</li>
            <li>Взыскать судебные расходы.</li>
          </ol>`
        ),
        [
          ...basicFields(1),
          {
            fieldName: 'recipient',
            label: 'Наименование суда',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'debtorName',
            label: 'ФИО должника',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 2,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'debtorAddress',
            label: 'Адрес должника',
            fieldType: 'textarea',
            required: true,
            stepNumber: 2,
            order: 3,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'debtAmount',
            label: 'Сумма долга (руб.)',
            fieldType: 'number',
            required: true,
            stepNumber: 3,
            order: 1,
            validationRules: JSON.stringify({ min: 1 }),
          },
          {
            fieldName: 'debtBasis',
            label: 'Основание долга',
            fieldType: 'textarea',
            placeholder: 'Договор займа от 01.01.2023',
            required: true,
            stepNumber: 3,
            order: 2,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'debtDeadline',
            label: 'Срок возврата',
            fieldType: 'date',
            required: true,
            stepNumber: 3,
            order: 3,
            validationRules: JSON.stringify({}),
          },
        ],
        categories
      ),
    },
    {
      ...createTemplate(
        'Исковое заявление о защите прав потребителей',
        'Защита прав потребителя при продаже товаров или оказании услуг ненадлежащего качества',
        'courts',
        'защита прав потребителей,некачественный товар,возврат,суд',
        'physical',
        standardDocumentHtml(
          'ИСКОВОЕ ЗАЯВЛЕНИЕ<br/>о защите прав потребителей',
          `<p>{{sellerName}} (адрес: {{sellerAddress}}) продал мне {{productName}} стоимостью {{productPrice}} руб.</p>
          <p>Дата покупки: {{purchaseDate}}. Товар оказался ненадлежащего качества: {{defects}}.</p>
          <p>Я обратился к продавцу с претензией {{claimDate}}, однако требования не удовлетворены.</p>
          <p>На основании изложенного, руководствуясь Законом о защите прав потребителей,</p>
          <p><strong>ПРОШУ:</strong></p>
          <ol>
            <li>Взыскать с {{sellerName}} стоимость товара {{productPrice}} руб.</li>
            <li>Взыскать неустойку {{penalty}} руб.</li>
            <li>Взыскать компенсацию морального вреда {{moralDamage}} руб.</li>
            <li>Взыскать штраф 50% от присужденной суммы.</li>
          </ol>`
        ),
        [
          ...basicFields(1),
          {
            fieldName: 'recipient',
            label: 'Наименование суда',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'sellerName',
            label: 'Наименование продавца',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 2,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'sellerAddress',
            label: 'Адрес продавца',
            fieldType: 'textarea',
            required: true,
            stepNumber: 2,
            order: 3,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'productName',
            label: 'Наименование товара/услуги',
            fieldType: 'text',
            required: true,
            stepNumber: 3,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'productPrice',
            label: 'Стоимость (руб.)',
            fieldType: 'number',
            required: true,
            stepNumber: 3,
            order: 2,
            validationRules: JSON.stringify({ min: 1 }),
          },
          {
            fieldName: 'purchaseDate',
            label: 'Дата покупки',
            fieldType: 'date',
            required: true,
            stepNumber: 3,
            order: 3,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'defects',
            label: 'Описание недостатков',
            fieldType: 'textarea',
            required: true,
            stepNumber: 3,
            order: 4,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'claimDate',
            label: 'Дата претензии',
            fieldType: 'date',
            required: true,
            stepNumber: 3,
            order: 5,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'penalty',
            label: 'Неустойка (руб.)',
            fieldType: 'number',
            required: false,
            stepNumber: 3,
            order: 6,
            validationRules: JSON.stringify({ min: 0 }),
          },
          {
            fieldName: 'moralDamage',
            label: 'Моральный вред (руб.)',
            fieldType: 'number',
            required: false,
            stepNumber: 3,
            order: 7,
            validationRules: JSON.stringify({ min: 0 }),
          },
        ],
        categories
      ),
    },
    {
      ...createTemplate(
        'Апелляционная жалоба на решение суда',
        'Обжалование решения суда первой инстанции',
        'courts',
        'апелляция,жалоба,обжалование,суд',
        'both',
        standardDocumentHtml(
          'АПЕЛЛЯЦИОННАЯ ЖАЛОБА',
          `<p>{{courtName}} {{judgmentDate}} вынес решение по делу №{{caseNumber}}.</p>
          <p>Решение суда является незаконным и необоснованным по следующим основаниям:</p>
          <p>{{appealReasons}}</p>
          <p>На основании изложенного, руководствуясь ст. 320-330 ГПК РФ,</p>
          <p><strong>ПРОШУ:</strong></p>
          <ol>
            <li>Отменить решение {{courtName}} от {{judgmentDate}}.</li>
            <li>Принять новое решение об удовлетворении моих требований.</li>
          </ol>`
        ),
        [
          ...basicFields(1),
          {
            fieldName: 'recipient',
            label: 'Апелляционная инстанция',
            fieldType: 'text',
            placeholder: 'Московский городской суд',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'courtName',
            label: 'Суд первой инстанции',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 2,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'caseNumber',
            label: 'Номер дела',
            fieldType: 'text',
            placeholder: '2-1234/2024',
            required: true,
            stepNumber: 2,
            order: 3,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'judgmentDate',
            label: 'Дата решения',
            fieldType: 'date',
            required: true,
            stepNumber: 2,
            order: 4,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'appealReasons',
            label: 'Основания апелляции',
            fieldType: 'textarea',
            required: true,
            stepNumber: 3,
            order: 1,
            validationRules: JSON.stringify({ minLength: 50 }),
          },
        ],
        categories
      ),
    },
    {
      ...createTemplate(
        'Заявление о выдаче судебного приказа',
        'Упрощенное взыскание задолженности через судебный приказ',
        'courts',
        'судебный приказ,взыскание,долг',
        'both',
        standardDocumentHtml(
          'ЗАЯВЛЕНИЕ<br/>о выдаче судебного приказа',
          `<p>{{debtorName}} имеет передо мной задолженность {{debtAmount}} руб.</p>
          <p>Основание: {{debtBasis}}. Срок возврата: {{deadline}}.</p>
          <p>На основании ст. 121-122 ГПК РФ,</p>
          <p><strong>ПРОШУ:</strong></p>
          <p>Выдать судебный приказ о взыскании с {{debtorName}} суммы {{debtAmount}} руб.</p>`
        ),
        [
          ...basicFields(1),
          {
            fieldName: 'recipient',
            label: 'Мировой суд',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'debtorName',
            label: 'ФИО должника',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 2,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'debtAmount',
            label: 'Сумма долга (руб.)',
            fieldType: 'number',
            required: true,
            stepNumber: 2,
            order: 3,
            validationRules: JSON.stringify({ min: 1, max: 500000 }),
          },
          {
            fieldName: 'debtBasis',
            label: 'Основание',
            fieldType: 'textarea',
            required: true,
            stepNumber: 2,
            order: 4,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'deadline',
            label: 'Срок возврата',
            fieldType: 'date',
            required: true,
            stepNumber: 2,
            order: 5,
            validationRules: JSON.stringify({}),
          },
        ],
        categories
      ),
    },

    // === БАНКИ ===
    {
      ...createTemplate(
        'Претензия в банк о возврате комиссии',
        'Возврат незаконно списанной банковской комиссии',
        'banks',
        'банк,комиссия,возврат,претензия',
        'both',
        standardDocumentHtml(
          'ПРЕТЕНЗИЯ<br/>о возврате комиссии',
          `<p>Я являюсь клиентом вашего банка, договор №{{contractNumber}} от {{contractDate}}.</p>
          <p>{{complaintDate}} с моего счета была списана комиссия в размере {{commissionAmount}} руб. за {{serviceDescription}}.</p>
          <p>Считаю списание незаконным по следующим основаниям: {{reasonsunlawful}}.</p>
          <p>На основании ст. 16 Закона о защите прав потребителей,</p>
          <p><strong>ТРЕБУЮ:</strong></p>
          <ol>
            <li>Вернуть незаконно списанную комиссию {{commissionAmount}} руб.</li>
            <li>Предоставить письменный ответ в течение 10 дней.</li>
          </ol>
          <p>В случае отказа буду вынужден обратиться в суд.</p>`
        ),
        [
          ...basicFields(1),
          {
            fieldName: 'recipient',
            label: 'Наименование банка',
            fieldType: 'text',
            placeholder: 'ПАО Сбербанк',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'contractNumber',
            label: 'Номер договора',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 2,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'contractDate',
            label: 'Дата договора',
            fieldType: 'date',
            required: true,
            stepNumber: 2,
            order: 3,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'complaintDate',
            label: 'Дата списания',
            fieldType: 'date',
            required: true,
            stepNumber: 2,
            order: 4,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'commissionAmount',
            label: 'Сумма комиссии (руб.)',
            fieldType: 'number',
            required: true,
            stepNumber: 3,
            order: 1,
            validationRules: JSON.stringify({ min: 1 }),
          },
          {
            fieldName: 'serviceDescription',
            label: 'За что списана комиссия',
            fieldType: 'text',
            placeholder: 'СМС-информирование',
            required: true,
            stepNumber: 3,
            order: 2,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'reasonsUnlawful',
            label: 'Почему списание незаконно',
            fieldType: 'textarea',
            required: true,
            stepNumber: 3,
            order: 3,
            validationRules: JSON.stringify({ minLength: 20 }),
          },
        ],
        categories
      ),
    },
    {
      ...createTemplate(
        'Заявление о досрочном погашении кредита',
        'Полное досрочное погашение кредита без комиссий',
        'banks',
        'кредит,досрочное погашение,банк',
        'both',
        standardDocumentHtml(
          'ЗАЯВЛЕНИЕ<br/>о досрочном погашении кредита',
          `<p>Я являюсь заемщиком по кредитному договору №{{loanNumber}} от {{loanDate}}.</p>
          <p>В соответствии со ст. 810 ГК РФ заявляю о своем намерении досрочно погасить кредит {{paymentDate}}.</p>
          <p>Сумма досрочного погашения: {{paymentAmount}} руб.</p>
          <p><strong>ПРОШУ:</strong></p>
          <ol>
            <li>Принять досрочное погашение кредита {{paymentDate}}.</li>
            <li>Предоставить расчет суммы досрочного погашения.</li>
            <li>Не начислять комиссию за досрочное погашение.</li>
          </ol>`
        ),
        [
          ...basicFields(1),
          {
            fieldName: 'recipient',
            label: 'Наименование банка',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'loanNumber',
            label: 'Номер кредитного договора',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 2,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'loanDate',
            label: 'Дата кредитного договора',
            fieldType: 'date',
            required: true,
            stepNumber: 2,
            order: 3,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'paymentDate',
            label: 'Дата планируемого погашения',
            fieldType: 'date',
            required: true,
            stepNumber: 2,
            order: 4,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'paymentAmount',
            label: 'Сумма погашения (руб.)',
            fieldType: 'number',
            required: true,
            stepNumber: 2,
            order: 5,
            validationRules: JSON.stringify({ min: 1 }),
          },
        ],
        categories
      ),
    },

    // === More BANK templates ===
    {
      ...createTemplate(
        'Претензия о незаконном списании средств',
        'Возврат средств, списанных без вашего согласия',
        'banks',
        'банк,списание,мошенничество,возврат',
        'both',
        standardDocumentHtml(
          'ПРЕТЕНЗИЯ<br/>о незаконном списании денежных средств',
          `<p>Я являюсь клиентом вашего банка, счет №{{accountNumber}}.</p>
          <p>{{incidentDate}} с моего счета были списаны денежные средства в размере {{amount}} руб. без моего согласия.</p>
          <p>Назначение платежа: {{paymentPurpose}}. Я не совершал(а) данную операцию.</p>
          <p><strong>ТРЕБУЮ:</strong></p>
          <ol>
            <li>Вернуть незаконно списанные средства {{amount}} руб.</li>
            <li>Провести служебное расследование.</li>
            <li>Предоставить письменный ответ в течение 10 дней.</li>
          </ol>`
        ),
        [
          ...basicFields(1),
          {
            fieldName: 'recipient',
            label: 'Наименование банка',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'accountNumber',
            label: 'Номер счета',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 2,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'incidentDate',
            label: 'Дата списания',
            fieldType: 'date',
            required: true,
            stepNumber: 2,
            order: 3,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'amount',
            label: 'Сумма списания (руб.)',
            fieldType: 'number',
            required: true,
            stepNumber: 2,
            order: 4,
            validationRules: JSON.stringify({ min: 1 }),
          },
          {
            fieldName: 'paymentPurpose',
            label: 'Назначение платежа',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 5,
            validationRules: JSON.stringify({}),
          },
        ],
        categories
      ),
    },
    {
      ...createTemplate(
        'Заявление о блокировке банковской карты',
        'Срочная блокировка карты при утере или краже',
        'banks',
        'блокировка карты,утеря,банк',
        'physical',
        standardDocumentHtml(
          'ЗАЯВЛЕНИЕ<br/>о блокировке банковской карты',
          `<p>Прошу заблокировать мою банковскую карту номер {{cardNumber}} в связи с {{reason}}.</p>
          <p>Обстоятельства: {{circumstances}}</p>
          <p>Дата инцидента: {{incidentDate}}</p>`
        ),
        [
          ...basicFields(1),
          {
            fieldName: 'recipient',
            label: 'Наименование банка',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'cardNumber',
            label: 'Последние 4 цифры карты',
            fieldType: 'text',
            placeholder: '****1234',
            required: true,
            stepNumber: 2,
            order: 2,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'reason',
            label: 'Причина блокировки',
            fieldType: 'select',
            options: 'утерей,кражей,подозрением на мошенничество',
            required: true,
            stepNumber: 2,
            order: 3,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'incidentDate',
            label: 'Дата инцидента',
            fieldType: 'date',
            required: true,
            stepNumber: 2,
            order: 4,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'circumstances',
            label: 'Обстоятельства',
            fieldType: 'textarea',
            required: true,
            stepNumber: 2,
            order: 5,
            validationRules: JSON.stringify({}),
          },
        ],
        categories
      ),
    },
    {
      ...createTemplate(
        'Претензия о навязывании банковских услуг',
        'Возврат средств за навязанные страховки и услуги',
        'banks',
        'навязывание услуг,страховка,банк',
        'both',
        standardDocumentHtml(
          'ПРЕТЕНЗИЯ<br/>о навязывании услуг',
          `<p>При оформлении {{productType}} в вашем банке мне была навязана услуга {{serviceName}} стоимостью {{serviceCost}} руб.</p>
          <p>Я не давал(а) согласия на подключение данной услуги. Договор был заключен {{contractDate}}.</p>
          <p>В соответствии со ст. 16 Закона о защите прав потребителей,</p>
          <p><strong>ТРЕБУЮ:</strong></p>
          <ol>
            <li>Расторгнуть договор на услугу {{serviceName}}.</li>
            <li>Вернуть уплаченные средства {{serviceCost}} руб.</li>
          </ol>`
        ),
        [
          ...basicFields(1),
          {
            fieldName: 'recipient',
            label: 'Наименование банка',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'productType',
            label: 'Какой продукт оформляли',
            fieldType: 'select',
            options: 'кредита,ипотеки,вклада,карты',
            required: true,
            stepNumber: 2,
            order: 2,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'serviceName',
            label: 'Навязанная услуга',
            fieldType: 'text',
            placeholder: 'Страхование жизни',
            required: true,
            stepNumber: 2,
            order: 3,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'serviceCost',
            label: 'Стоимость услуги (руб.)',
            fieldType: 'number',
            required: true,
            stepNumber: 2,
            order: 4,
            validationRules: JSON.stringify({ min: 1 }),
          },
          {
            fieldName: 'contractDate',
            label: 'Дата договора',
            fieldType: 'date',
            required: true,
            stepNumber: 2,
            order: 5,
            validationRules: JSON.stringify({}),
          },
        ],
        categories
      ),
    },

    // === ФНС templates ===
    {
      ...createTemplate(
        'Заявление на налоговый вычет за обучение',
        'Социальный налоговый вычет на обучение',
        'fns',
        'налоговый вычет,обучение,фнс',
        'physical',
        standardDocumentHtml(
          'ЗАЯВЛЕНИЕ<br/>на предоставление социального налогового вычета',
          `<p>Прошу предоставить мне социальный налоговый вычет по расходам на обучение за {{year}} год.</p>
          <p>Я оплатил(а) обучение в {{educationOrg}} в размере {{amount}} руб.</p>
          <p>Вид обучения: {{educationType}}</p>
          <p>Прошу вернуть НДФЛ в размере {{refundAmount}} руб. на счет {{bankAccount}}.</p>`
        ),
        [
          ...basicFields(1),
          {
            fieldName: 'recipient',
            label: 'Налоговая инспекция',
            fieldType: 'text',
            placeholder: 'ИФНС № по г. Москве',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'year',
            label: 'Налоговый период (год)',
            fieldType: 'number',
            placeholder: '2023',
            required: true,
            stepNumber: 2,
            order: 2,
            validationRules: JSON.stringify({ min: 2015, max: 2025 }),
          },
          {
            fieldName: 'educationOrg',
            label: 'Учебное заведение',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 3,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'educationType',
            label: 'Вид обучения',
            fieldType: 'select',
            options:
              'свое обучение,обучение детей,обучение братьев/сестер',
            required: true,
            stepNumber: 2,
            order: 4,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'amount',
            label: 'Сумма расходов (руб.)',
            fieldType: 'number',
            required: true,
            stepNumber: 3,
            order: 1,
            validationRules: JSON.stringify({ min: 1, max: 120000 }),
          },
          {
            fieldName: 'refundAmount',
            label: 'Сумма возврата НДФЛ (руб.)',
            fieldType: 'number',
            required: true,
            stepNumber: 3,
            order: 2,
            validationRules: JSON.stringify({ min: 1 }),
          },
          {
            fieldName: 'bankAccount',
            label: 'Номер счета для возврата',
            fieldType: 'text',
            placeholder: '40817810099910004312',
            required: true,
            stepNumber: 3,
            order: 3,
            validationRules: JSON.stringify({ minLength: 20, maxLength: 20 }),
          },
        ],
        categories
      ),
    },
    {
      ...createTemplate(
        'Заявление на имущественный налоговый вычет',
        'Вычет при покупке квартиры или дома',
        'fns',
        'налоговый вычет,квартира,недвижимость,фнс',
        'physical',
        standardDocumentHtml(
          'ЗАЯВЛЕНИЕ<br/>на предоставление имущественного налогового вычета',
          `<p>Прошу предоставить мне имущественный налоговый вычет в связи с приобретением жилья.</p>
          <p>Объект недвижимости: {{propertyAddress}}</p>
          <p>Дата приобретения: {{purchaseDate}}</p>
          <p>Стоимость: {{propertyCost}} руб.</p>
          <p>Прошу вернуть НДФЛ за {{year}} год в размере {{refundAmount}} руб. на счет {{bankAccount}}.</p>`
        ),
        [
          ...basicFields(1),
          {
            fieldName: 'recipient',
            label: 'Налоговая инспекция',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'year',
            label: 'Налоговый период (год)',
            fieldType: 'number',
            required: true,
            stepNumber: 2,
            order: 2,
            validationRules: JSON.stringify({ min: 2015, max: 2025 }),
          },
          {
            fieldName: 'propertyAddress',
            label: 'Адрес недвижимости',
            fieldType: 'textarea',
            required: true,
            stepNumber: 2,
            order: 3,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'purchaseDate',
            label: 'Дата приобретения',
            fieldType: 'date',
            required: true,
            stepNumber: 2,
            order: 4,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'propertyCost',
            label: 'Стоимость недвижимости (руб.)',
            fieldType: 'number',
            required: true,
            stepNumber: 3,
            order: 1,
            validationRules: JSON.stringify({ min: 1, max: 2000000 }),
          },
          {
            fieldName: 'refundAmount',
            label: 'Сумма возврата НДФЛ (руб.)',
            fieldType: 'number',
            required: true,
            stepNumber: 3,
            order: 2,
            validationRules: JSON.stringify({ min: 1 }),
          },
          {
            fieldName: 'bankAccount',
            label: 'Номер счета',
            fieldType: 'text',
            required: true,
            stepNumber: 3,
            order: 3,
            validationRules: JSON.stringify({ minLength: 20, maxLength: 20 }),
          },
        ],
        categories
      ),
    },
    {
      ...createTemplate(
        'Заявление на регистрацию ИП (форма Р21001)',
        'Регистрация индивидуального предпринимателя',
        'fns',
        'ип,регистрация ип,предприниматель,фнс',
        'physical',
        standardDocumentHtml(
          'ЗАЯВЛЕНИЕ<br/>о государственной регистрации физического лица<br/>в качестве индивидуального предпринимателя',
          `<p>Прошу зарегистрировать меня в качестве индивидуального предпринимателя.</p>
          <p>Вид деятельности (ОКВЭД): {{okved}}</p>
          <p>Система налогообложения: {{taxSystem}}</p>
          <p>Контактные данные:</p>
          <ul>
            <li>Телефон: {{phone}}</li>
            <li>Email: {{email}}</li>
          </ul>`
        ),
        [
          ...basicFields(1),
          {
            fieldName: 'recipient',
            label: 'Налоговая инспекция',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'okved',
            label: 'Код ОКВЭД',
            fieldType: 'text',
            placeholder: '62.01',
            required: true,
            stepNumber: 2,
            order: 2,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'taxSystem',
            label: 'Система налогообложения',
            fieldType: 'select',
            options: 'УСН Доходы,УСН Доходы минус Расходы,ОСНО,ПСН',
            required: true,
            stepNumber: 2,
            order: 3,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'email',
            label: 'Email',
            fieldType: 'text',
            placeholder: 'example@mail.com',
            required: true,
            stepNumber: 2,
            order: 4,
            validationRules: JSON.stringify({}),
          },
        ],
        categories
      ),
    },
    {
      ...createTemplate(
        'Заявление на закрытие ИП (форма Р26001)',
        'Прекращение деятельности индивидуального предпринимателя',
        'fns',
        'закрытие ип,ликвидация ип,фнс',
        'physical',
        standardDocumentHtml(
          'ЗАЯВЛЕНИЕ<br/>о прекращении деятельности физического лица<br/>в качестве индивидуального предпринимателя',
          `<p>Прошу прекратить мою деятельность в качестве индивидуального предпринимателя.</p>
          <p>ОГРНИП: {{ogrnip}}</p>
          <p>ИНН: {{inn}}</p>
          <p>Причина: {{reason}}</p>`
        ),
        [
          ...basicFields(1),
          {
            fieldName: 'recipient',
            label: 'Налоговая инспекция',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'ogrnip',
            label: 'ОГРНИП',
            fieldType: 'text',
            placeholder: '123456789012345',
            required: true,
            stepNumber: 2,
            order: 2,
            validationRules: JSON.stringify({ minLength: 15, maxLength: 15 }),
          },
          {
            fieldName: 'inn',
            label: 'ИНН',
            fieldType: 'text',
            placeholder: '123456789012',
            required: true,
            stepNumber: 2,
            order: 3,
            validationRules: JSON.stringify({ minLength: 12, maxLength: 12 }),
          },
          {
            fieldName: 'reason',
            label: 'Причина закрытия',
            fieldType: 'textarea',
            required: false,
            stepNumber: 2,
            order: 4,
            validationRules: JSON.stringify({}),
          },
        ],
        categories
      ),
    },
    {
      ...createTemplate(
        'Заявление на налоговый вычет за лечение',
        'Социальный вычет за медицинские услуги и лекарства',
        'fns',
        'налоговый вычет,лечение,медицина,фнс',
        'physical',
        standardDocumentHtml(
          'ЗАЯВЛЕНИЕ<br/>на предоставление социального налогового вычета за лечение',
          `<p>Прошу предоставить мне социальный налоговый вычет по расходам на лечение за {{year}} год.</p>
          <p>Медицинское учреждение: {{medOrg}}</p>
          <p>Вид лечения: {{treatmentType}}</p>
          <p>Сумма расходов: {{amount}} руб.</p>
          <p>Прошу вернуть НДФЛ в размере {{refundAmount}} руб. на счет {{bankAccount}}.</p>`
        ),
        [
          ...basicFields(1),
          {
            fieldName: 'recipient',
            label: 'Налоговая инспекция',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'year',
            label: 'Налоговый период (год)',
            fieldType: 'number',
            required: true,
            stepNumber: 2,
            order: 2,
            validationRules: JSON.stringify({ min: 2015, max: 2025 }),
          },
          {
            fieldName: 'medOrg',
            label: 'Медицинское учреждение',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 3,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'treatmentType',
            label: 'Вид лечения/услуги',
            fieldType: 'text',
            placeholder: 'Стоматология',
            required: true,
            stepNumber: 2,
            order: 4,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'amount',
            label: 'Сумма расходов (руб.)',
            fieldType: 'number',
            required: true,
            stepNumber: 3,
            order: 1,
            validationRules: JSON.stringify({ min: 1, max: 120000 }),
          },
          {
            fieldName: 'refundAmount',
            label: 'Сумма возврата НДФЛ (руб.)',
            fieldType: 'number',
            required: true,
            stepNumber: 3,
            order: 2,
            validationRules: JSON.stringify({ min: 1 }),
          },
          {
            fieldName: 'bankAccount',
            label: 'Номер счета',
            fieldType: 'text',
            required: true,
            stepNumber: 3,
            order: 3,
            validationRules: JSON.stringify({ minLength: 20, maxLength: 20 }),
          },
        ],
        categories
      ),
    },

    // === РАБОТОДАТЕЛИ ===
    {
      ...createTemplate(
        'Заявление на отпуск',
        'Предоставление ежегодного оплачиваемого отпуска',
        'employers',
        'отпуск,работа,отдых',
        'physical',
        standardDocumentHtml(
          'ЗАЯВЛЕНИЕ',
          `<p>Прошу предоставить мне ежегодный оплачиваемый отпуск на {{days}} календарных дней с {{startDate}} по {{endDate}}.</p>`
        ),
        [
          ...basicFields(1),
          {
            fieldName: 'recipient',
            label: 'Работодатель (должность, ФИО)',
            fieldType: 'text',
            placeholder: 'Генеральному директору ООО "Компания" Иванову И.И.',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'startDate',
            label: 'Дата начала отпуска',
            fieldType: 'date',
            required: true,
            stepNumber: 2,
            order: 2,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'endDate',
            label: 'Дата окончания отпуска',
            fieldType: 'date',
            required: true,
            stepNumber: 2,
            order: 3,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'days',
            label: 'Количество дней',
            fieldType: 'number',
            placeholder: '14',
            required: true,
            stepNumber: 2,
            order: 4,
            validationRules: JSON.stringify({ min: 1, max: 365 }),
          },
        ],
        categories
      ),
    },
    {
      ...createTemplate(
        'Заявление об увольнении по собственному желанию',
        'Расторжение трудового договора по инициативе работника',
        'employers',
        'увольнение,работа,трудовой договор',
        'physical',
        standardDocumentHtml(
          'ЗАЯВЛЕНИЕ<br/>об увольнении',
          `<p>Прошу уволить меня по собственному желанию {{dismissalDate}}.</p>
          <p>{{reason}}</p>`
        ),
        [
          ...basicFields(1),
          {
            fieldName: 'recipient',
            label: 'Работодатель',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'dismissalDate',
            label: 'Дата увольнения',
            fieldType: 'date',
            required: true,
            stepNumber: 2,
            order: 2,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'reason',
            label: 'Причина (необязательно)',
            fieldType: 'textarea',
            required: false,
            stepNumber: 2,
            order: 3,
            validationRules: JSON.stringify({}),
          },
        ],
        categories
      ),
    },
    {
      ...createTemplate(
        'Заявление на отпуск за свой счет',
        'Отпуск без сохранения заработной платы',
        'employers',
        'отпуск за свой счет,работа',
        'physical',
        standardDocumentHtml(
          'ЗАЯВЛЕНИЕ',
          `<p>Прошу предоставить мне отпуск без сохранения заработной платы на {{days}} дней с {{startDate}} по {{endDate}}.</p>
          <p>Причина: {{reason}}</p>`
        ),
        [
          ...basicFields(1),
          {
            fieldName: 'recipient',
            label: 'Работодатель',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'startDate',
            label: 'Дата начала',
            fieldType: 'date',
            required: true,
            stepNumber: 2,
            order: 2,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'endDate',
            label: 'Дата окончания',
            fieldType: 'date',
            required: true,
            stepNumber: 2,
            order: 3,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'days',
            label: 'Количество дней',
            fieldType: 'number',
            required: true,
            stepNumber: 2,
            order: 4,
            validationRules: JSON.stringify({ min: 1 }),
          },
          {
            fieldName: 'reason',
            label: 'Причина',
            fieldType: 'textarea',
            required: true,
            stepNumber: 2,
            order: 5,
            validationRules: JSON.stringify({}),
          },
        ],
        categories
      ),
    },
    {
      ...createTemplate(
        'Заявление на отпуск по уходу за ребенком',
        'Декретный отпуск до достижения ребенком возраста 3 лет',
        'employers',
        'декрет,отпуск,ребенок,работа',
        'physical',
        standardDocumentHtml(
          'ЗАЯВЛЕНИЕ<br/>об отпуске по уходу за ребенком',
          `<p>Прошу предоставить мне отпуск по уходу за ребенком {{childName}} (дата рождения {{childBirthDate}}) до достижения им возраста {{ageLimit}} лет.</p>
          <p>Отпуск прошу предоставить с {{startDate}}.</p>`
        ),
        [
          ...basicFields(1),
          {
            fieldName: 'recipient',
            label: 'Работодатель',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'childName',
            label: 'ФИО ребенка',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 2,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'childBirthDate',
            label: 'Дата рождения ребенка',
            fieldType: 'date',
            required: true,
            stepNumber: 2,
            order: 3,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'startDate',
            label: 'Дата начала отпуска',
            fieldType: 'date',
            required: true,
            stepNumber: 2,
            order: 4,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'ageLimit',
            label: 'До скольких лет',
            fieldType: 'select',
            options: '1.5,3',
            required: true,
            stepNumber: 2,
            order: 5,
            validationRules: JSON.stringify({}),
          },
        ],
        categories
      ),
    },
    {
      ...createTemplate(
        'Заявление на перевод на другую должность',
        'Постоянный перевод на другую должность или в другое подразделение',
        'employers',
        'перевод,работа,должность',
        'physical',
        standardDocumentHtml(
          'ЗАЯВЛЕНИЕ<br/>о переводе',
          `<p>Прошу перевести меня с должности {{currentPosition}} на должность {{newPosition}} с {{transferDate}}.</p>`
        ),
        [
          ...basicFields(1),
          {
            fieldName: 'recipient',
            label: 'Работодатель',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'currentPosition',
            label: 'Текущая должность',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 2,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'newPosition',
            label: 'Новая должность',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 3,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'transferDate',
            label: 'Дата перевода',
            fieldType: 'date',
            required: true,
            stepNumber: 2,
            order: 4,
            validationRules: JSON.stringify({}),
          },
        ],
        categories
      ),
    },

    // === ДРУГИЕ ОРГАНИЗАЦИИ ===
    {
      ...createTemplate(
        'Жалоба в ЖКХ на некачественные услуги',
        'Претензия по качеству коммунальных услуг',
        'other',
        'жкх,коммунальные услуги,жалоба',
        'physical',
        standardDocumentHtml(
          'ЖАЛОБА<br/>на некачественное оказание услуг',
          `<p>Я проживаю по адресу: {{address}}.</p>
          <p>{{complaintDate}} была выявлена проблема: {{problem}}.</p>
          <p><strong>ТРЕБУЮ:</strong></p>
          <ol>
            <li>Устранить недостатки в срок до {{deadline}}.</li>
            <li>Сделать перерасчет платы за услуги.</li>
            <li>Предоставить письменный ответ.</li>
          </ol>`
        ),
        [
          ...basicFields(1),
          {
            fieldName: 'recipient',
            label: 'Управляющая компания',
            fieldType: 'text',
            placeholder: 'ООО "Управляющая компания"',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'complaintDate',
            label: 'Дата обнаружения проблемы',
            fieldType: 'date',
            required: true,
            stepNumber: 2,
            order: 2,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'problem',
            label: 'Описание проблемы',
            fieldType: 'textarea',
            placeholder: 'Отсутствие горячей воды более 3 дней',
            required: true,
            stepNumber: 2,
            order: 3,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'deadline',
            label: 'Срок устранения',
            fieldType: 'date',
            required: true,
            stepNumber: 2,
            order: 4,
            validationRules: JSON.stringify({}),
          },
        ],
        categories
      ),
    },
    {
      ...createTemplate(
        'Заявление о перерасчете коммунальных услуг',
        'Перерасчет платы при некачественном оказании услуг или временном отсутствии',
        'other',
        'жкх,перерасчет,коммунальные услуги',
        'physical',
        standardDocumentHtml(
          'ЗАЯВЛЕНИЕ<br/>о перерасчете платы за коммунальные услуги',
          `<p>Прошу сделать перерасчет платы за {{serviceType}} за период с {{startDate}} по {{endDate}}.</p>
          <p>Основание: {{reason}}</p>
          <p>Адрес: {{address}}</p>`
        ),
        [
          ...basicFields(1),
          {
            fieldName: 'recipient',
            label: 'Управляющая компания',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'serviceType',
            label: 'Вид услуги',
            fieldType: 'select',
            options:
              'холодное водоснабжение,горячее водоснабжение,отопление,водоотведение,все услуги',
            required: true,
            stepNumber: 2,
            order: 2,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'startDate',
            label: 'Дата начала периода',
            fieldType: 'date',
            required: true,
            stepNumber: 2,
            order: 3,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'endDate',
            label: 'Дата окончания периода',
            fieldType: 'date',
            required: true,
            stepNumber: 2,
            order: 4,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'reason',
            label: 'Основание для перерасчета',
            fieldType: 'textarea',
            placeholder:
              'Временное отсутствие (командировка, отпуск) или некачественное оказание услуг',
            required: true,
            stepNumber: 2,
            order: 5,
            validationRules: JSON.stringify({}),
          },
        ],
        categories
      ),
    },
    {
      ...createTemplate(
        'Заявление в школу/детский сад',
        'Зачисление ребенка в образовательное учреждение',
        'other',
        'школа,детский сад,образование,зачисление',
        'physical',
        standardDocumentHtml(
          'ЗАЯВЛЕНИЕ<br/>о зачислении',
          `<p>Прошу зачислить моего ребенка {{childName}} (дата рождения {{childBirthDate}}) в {{educationType}} с {{startDate}}.</p>
          <p>Класс/группа: {{group}}</p>`
        ),
        [
          ...basicFields(1),
          {
            fieldName: 'recipient',
            label: 'Наименование учреждения',
            fieldType: 'text',
            placeholder: 'МБОУ "Школа №1"',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'educationType',
            label: 'Тип учреждения',
            fieldType: 'select',
            options: 'школу,детский сад,кружок',
            required: true,
            stepNumber: 2,
            order: 2,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'childName',
            label: 'ФИО ребенка',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 3,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'childBirthDate',
            label: 'Дата рождения ребенка',
            fieldType: 'date',
            required: true,
            stepNumber: 2,
            order: 4,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'group',
            label: 'Класс/группа',
            fieldType: 'text',
            placeholder: '1 класс',
            required: true,
            stepNumber: 2,
            order: 5,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'startDate',
            label: 'Дата начала обучения',
            fieldType: 'date',
            required: true,
            stepNumber: 2,
            order: 6,
            validationRules: JSON.stringify({}),
          },
        ],
        categories
      ),
    },
    {
      ...createTemplate(
        'Претензия поставщику товаров/услуг',
        'Общая претензия по договору поставки или оказания услуг',
        'other',
        'претензия,договор,поставка,услуги',
        'both',
        standardDocumentHtml(
          'ПРЕТЕНЗИЯ',
          `<p>Между мной и {{supplierName}} заключен договор №{{contractNumber}} от {{contractDate}}.</p>
          <p>По условиям договора {{supplierName}} обязался {{contractSubject}}.</p>
          <p>Договор нарушен следующим образом: {{violation}}.</p>
          <p><strong>ТРЕБУЮ:</strong></p>
          <ol>
            <li>{{demand1}}</li>
            <li>Предоставить письменный ответ в течение {{responseDeadline}} дней.</li>
          </ol>
          <p>В случае отказа буду вынужден обратиться в суд.</p>`
        ),
        [
          ...basicFields(1),
          {
            fieldName: 'recipient',
            label: 'Наименование поставщика',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'supplierName',
            label: 'Название организации',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 2,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'contractNumber',
            label: 'Номер договора',
            fieldType: 'text',
            required: true,
            stepNumber: 2,
            order: 3,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'contractDate',
            label: 'Дата договора',
            fieldType: 'date',
            required: true,
            stepNumber: 2,
            order: 4,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'contractSubject',
            label: 'Предмет договора',
            fieldType: 'textarea',
            placeholder: 'поставить товар, оказать услугу...',
            required: true,
            stepNumber: 3,
            order: 1,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'violation',
            label: 'Описание нарушения',
            fieldType: 'textarea',
            required: true,
            stepNumber: 3,
            order: 2,
            validationRules: JSON.stringify({ minLength: 20 }),
          },
          {
            fieldName: 'demand1',
            label: 'Требование',
            fieldType: 'textarea',
            placeholder: 'Устранить недостатки, вернуть денежные средства...',
            required: true,
            stepNumber: 3,
            order: 3,
            validationRules: JSON.stringify({}),
          },
          {
            fieldName: 'responseDeadline',
            label: 'Срок ответа (дней)',
            fieldType: 'number',
            placeholder: '10',
            required: true,
            stepNumber: 3,
            order: 4,
            validationRules: JSON.stringify({ min: 1, max: 90 }),
          },
        ],
        categories
      ),
    },
  ]

  // Batch create all templates
  for (const templateData of templatesData) {
    await prisma.template.create({ data: templateData })
  }

  console.log(`✅ Создано ${templatesData.length} шаблонов`)
  console.log('🎉 База данных успешно заполнена!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
