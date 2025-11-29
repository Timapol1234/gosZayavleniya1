import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function to create form fields
function createBasicInfoFields(stepNumber: number = 1, startingOrder: number = 1) {
  return [
    {
      fieldName: 'fullName',
      label: 'ФИО полностью',
      fieldType: 'text',
      placeholder: 'Иванов Иван Иванович',
      isRequired: true,
      stepNumber,
      order: startingOrder,
      validationRules: JSON.stringify({
        minLength: 3,
        maxLength: 100,
      }),
    },
    {
      fieldName: 'birthDate',
      label: 'Дата рождения',
      fieldType: 'date',
      isRequired: true,
      stepNumber,
      order: startingOrder + 1,
      validationRules: JSON.stringify({}),
    },
    {
      fieldName: 'passport',
      label: 'Паспортные данные (серия и номер)',
      fieldType: 'text',
      placeholder: '1234 567890',
      isRequired: true,
      stepNumber,
      order: startingOrder + 2,
      validationRules: JSON.stringify({
        pattern: '^\\d{4} \\d{6}$',
      }),
    },
    {
      fieldName: 'address',
      label: 'Адрес регистрации',
      fieldType: 'textarea',
      placeholder: 'г. Москва, ул. Ленина, д. 1, кв. 1',
      isRequired: true,
      stepNumber,
      order: startingOrder + 3,
      validationRules: JSON.stringify({
        minLength: 10,
      }),
    },
    {
      fieldName: 'phone',
      label: 'Контактный телефон',
      fieldType: 'text',
      placeholder: '+7 (999) 123-45-67',
      isRequired: true,
      stepNumber,
      order: startingOrder + 4,
      validationRules: JSON.stringify({
        pattern: '^\\+7 \\(\\d{3}\\) \\d{3}-\\d{2}-\\d{2}$',
      }),
    },
  ]
}

export async function seedTemplates(categories: any[]) {
  const templates = []

  // ========== МФЦ И ГОСУСЛУГИ ==========

  // 1. Заявление на получение паспорта
  templates.push(
    await prisma.template.create({
      data: {
        title: 'Заявление на получение паспорта РФ',
        description:
          'Заявление на получение или замену паспорта гражданина РФ в связи с достижением возраста или порчей',
        categoryId: categories.find((c) => c.slug === 'mfc-gosuslugi')!.id,
        applicantType: 'physical',
        tags: 'паспорт,замена паспорта,получение паспорта,мфц',
        contentJson: JSON.stringify({
          html: `
<div style="font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.5;">
  <div style="text-align: right; margin-bottom: 20px;">
    В {{organizationName}}<br/>
    от {{fullName}}<br/>
    Дата рождения: {{birthDate}}<br/>
    Адрес: {{address}}<br/>
    Телефон: {{phone}}
  </div>

  <h2 style="text-align: center; font-size: 16pt; font-weight: bold; margin: 30px 0;">
    ЗАЯВЛЕНИЕ<br/>
    о выдаче (замене) паспорта гражданина Российской Федерации
  </h2>

  <p>Прошу выдать (заменить) паспорт гражданина Российской Федерации в связи с {{reason}}.</p>

  <p><strong>Мои данные:</strong></p>
  <ul>
    <li>ФИО: {{fullName}}</li>
    <li>Дата рождения: {{birthDate}}</li>
    <li>Место рождения: {{birthPlace}}</li>
    <li>Адрес регистрации: {{address}}</li>
    <li>Контактный телефон: {{phone}}</li>
  </ul>

  <p><strong>Прежний паспорт:</strong> серия {{oldPassportSeries}}, номер {{oldPassportNumber}}, выдан {{oldPassportIssueDate}}</p>

  <p>К заявлению прилагаю следующие документы:</p>
  <ol>
    <li>Фотографии 2 шт.</li>
    <li>Квитанция об оплате госпошлины</li>
    <li>Документы для проставления обязательных отметок (при наличии)</li>
  </ol>

  <p style="margin-top: 40px;">
    Дата: __________<br/>
    Подпись: __________ {{fullName}}
  </p>
</div>`,
        }),
        formFields: {
          create: [
            ...createBasicInfoFields(1, 1),
            {
              fieldName: 'organizationName',
              label: 'Наименование отделения МВД',
              fieldType: 'text',
              placeholder: 'Отделение УФМС России по г. Москве',
              isRequired: true,
              stepNumber: 2,
              order: 1,
              validationRules: JSON.stringify({}),
            },
            {
              fieldName: 'reason',
              label: 'Причина замены паспорта',
              fieldType: 'select',
              options: 'достижением 20-летнего возраста,достижением 45-летнего возраста,непригодностью к использованию,изменением персональных данных',
              isRequired: true,
              stepNumber: 2,
              order: 2,
              validationRules: JSON.stringify({}),
            },
            {
              fieldName: 'birthPlace',
              label: 'Место рождения',
              fieldType: 'text',
              placeholder: 'г. Москва',
              isRequired: true,
              stepNumber: 2,
              order: 3,
              validationRules: JSON.stringify({}),
            },
            {
              fieldName: 'oldPassportSeries',
              label: 'Серия старого паспорта',
              fieldType: 'text',
              placeholder: '1234',
              isRequired: false,
              stepNumber: 2,
              order: 4,
              validationRules: JSON.stringify({}),
            },
            {
              fieldName: 'oldPassportNumber',
              label: 'Номер старого паспорта',
              fieldType: 'text',
              placeholder: '567890',
              isRequired: false,
              stepNumber: 2,
              order: 5,
              validationRules: JSON.stringify({}),
            },
            {
              fieldName: 'oldPassportIssueDate',
              label: 'Дата выдачи старого паспорта',
              fieldType: 'date',
              isRequired: false,
              stepNumber: 2,
              order: 6,
              validationRules: JSON.stringify({}),
            },
          ],
        },
      },
    })
  )

  // 2. Заявление на регистрацию по месту жительства
  templates.push(
    await prisma.template.create({
      data: {
        title: 'Заявление о регистрации по месту жительства',
        description:
          'Заявление на постановку на регистрационный учет по месту жительства (прописка)',
        categoryId: categories.find((c) => c.slug === 'mfc-gosuslugi')!.id,
        applicantType: 'physical',
        tags: 'прописка,регистрация,место жительства,мфц',
        contentJson: JSON.stringify({
          html: `
<div style="font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.5;">
  <div style="text-align: right; margin-bottom: 20px;">
    В {{organizationName}}<br/>
    от {{fullName}}<br/>
    Паспорт: {{passport}}<br/>
    Телефон: {{phone}}
  </div>

  <h2 style="text-align: center; font-size: 16pt; font-weight: bold; margin: 30px 0;">
    ЗАЯВЛЕНИЕ<br/>
    о регистрации по месту жительства
  </h2>

  <p>Прошу зарегистрировать меня по адресу: {{newAddress}}</p>

  <p><strong>Данные заявителя:</strong></p>
  <ul>
    <li>ФИО: {{fullName}}</li>
    <li>Дата рождения: {{birthDate}}</li>
    <li>Паспортные данные: {{passport}}</li>
    <li>Прежний адрес регистрации: {{oldAddress}}</li>
    <li>Новый адрес регистрации: {{newAddress}}</li>
    <li>Контактный телефон: {{phone}}</li>
  </ul>

  <p><strong>Основание для регистрации:</strong> {{registrationBasis}}</p>

  <p>К заявлению прилагаю:</p>
  <ol>
    <li>Документ, удостоверяющий личность</li>
    <li>Документ-основание для вселения (свидетельство о праве собственности, договор найма и т.п.)</li>
    <li>Согласие собственника жилого помещения</li>
  </ol>

  <p style="margin-top: 40px;">
    Дата: __________<br/>
    Подпись: __________ {{fullName}}
  </p>
</div>`,
        }),
        formFields: {
          create: [
            ...createBasicInfoFields(1, 1),
            {
              fieldName: 'organizationName',
              label: 'Наименование МФЦ или УВМ МВД',
              fieldType: 'text',
              placeholder: 'МФЦ района Замоскворечье',
              isRequired: true,
              stepNumber: 2,
              order: 1,
              validationRules: JSON.stringify({}),
            },
            {
              fieldName: 'oldAddress',
              label: 'Прежний адрес регистрации',
              fieldType: 'textarea',
              placeholder: 'г. Москва, ул. Старая, д. 1, кв. 1',
              isRequired: false,
              stepNumber: 2,
              order: 2,
              validationRules: JSON.stringify({}),
            },
            {
              fieldName: 'newAddress',
              label: 'Новый адрес регистрации',
              fieldType: 'textarea',
              placeholder: 'г. Москва, ул. Новая, д. 2, кв. 2',
              isRequired: true,
              stepNumber: 2,
              order: 3,
              validationRules: JSON.stringify({}),
            },
            {
              fieldName: 'registrationBasis',
              label: 'Основание для регистрации',
              fieldType: 'select',
              options: 'право собственности,договор найма жилого помещения,согласие собственника,решение суда',
              isRequired: true,
              stepNumber: 2,
              order: 4,
              validationRules: JSON.stringify({}),
            },
          ],
        },
      },
    })
  )

  console.log(`✅ Создано ${templates.length} шаблонов для МФЦ`)

  // Will continue with more templates in the next part...
  return templates
}
