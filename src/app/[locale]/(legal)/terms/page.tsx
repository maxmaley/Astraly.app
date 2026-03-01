import type { Metadata } from "next";

const titles = {
  ru: "Условия использования",
  en: "Terms of Service",
  uk: "Умови використання",
};

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const l = params.locale as keyof typeof titles;
  return { title: titles[l] ?? titles.ru };
}

export default function TermsPage({ params }: { params: { locale: string } }) {
  if (params.locale === "en") return <ContentEN />;
  if (params.locale === "uk") return <ContentUK />;
  return <ContentRU />;
}

/* ─── RUSSIAN ─────────────────────────────────────────────── */
function ContentRU() {
  return (
    <Article title="Условия использования" date="Последнее обновление: 1 марта 2026 г.">
      <Section title="1. Принятие условий">
        <p>Используя сервис Astraly (astraly.app), вы соглашаетесь с настоящими Условиями. Если вы не согласны — прекратите использование Сервиса.</p>
        <p>Оператор: <strong>Maksym Olliinyk</strong>, г. Батуми, Грузия. Контакт: <Email /></p>
      </Section>
      <Section title="2. Описание Сервиса">
        <p>Astraly предоставляет: расчёт натальной карты, AI-интерпретацию, астро-календарь, AI-чат, ежедневные гороскопы, анализ совместимости.</p>
        <p className="font-medium text-[var(--foreground)] mt-4">Важно</p>
        <p>Сервис предоставляется исключительно в <strong>развлекательных и познавательных целях</strong>. Астрологические интерпретации не являются медицинским, психологическим, финансовым или юридическим советом.</p>
      </Section>
      <Section title="3. Возраст">
        <p>Для использования Сервиса — не менее <strong>13 лет</strong>. Для оформления платной подписки — не менее <strong>18 лет</strong>. Создавая аккаунт, вы подтверждаете соответствие этим требованиям.</p>
      </Section>
      <Section title="4. Аккаунт">
        <ul>
          <li>Вы несёте ответственность за безопасность аккаунта и пароля</li>
          <li>Не допускается создание нескольких аккаунтов одним пользователем</li>
          <li>Запрещена передача доступа третьим лицам</li>
          <li>При подозрении на взлом — сразу смените пароль и напишите нам</li>
        </ul>
      </Section>
      <Section title="5. Подписка и оплата">
        <ul>
          <li>Часть функций доступна бесплатно</li>
          <li>Платные планы тарифицируются ежемесячно или ежегодно</li>
          <li>Оплата обрабатывается сторонним провайдером; данные карты мы не храним</li>
          <li>Подписку можно отменить в любой момент; доступ сохраняется до конца периода</li>
          <li>Цены могут изменяться с уведомлением за 30 дней</li>
        </ul>
      </Section>
      <Section title="6. Запрещённое использование">
        <ul>
          <li>Использование в незаконных целях</li>
          <li>Несанкционированный доступ к системам или аккаунтам других пользователей</li>
          <li>Автоматическое извлечение данных без письменного разрешения</li>
          <li>Распространение вредоносного ПО</li>
          <li>Выдача себя за других лиц или организации</li>
          <li>Перепродажа Сервиса без письменного соглашения с нами</li>
        </ul>
      </Section>
      <Section title="7. Интеллектуальная собственность">
        <p>Дизайн, тексты, код и логотип Astraly защищены авторским правом. Контент, генерируемый AI на основе ваших данных, предоставляется для личного некоммерческого использования.</p>
      </Section>
      <Section title="8. Отказ от гарантий">
        <p>Сервис предоставляется «как есть». Мы не гарантируем точность астрологических интерпретаций, бесперебойную работу или соответствие ожиданиям.</p>
      </Section>
      <Section title="9. Ограничение ответственности">
        <p>В максимальной степени, допустимой законом, Astraly не несёт ответственности за косвенный или последующий ущерб. Максимальная ответственность — сумма оплаты за последние 3 месяца подписки.</p>
      </Section>
      <Section title="10. Прекращение">
        <p>Мы вправе заблокировать аккаунт при нарушении Условий. Вы можете удалить аккаунт в любое время через настройки или написав на <Email />.</p>
      </Section>
      <Section title="11. Изменения условий">
        <p>При существенных изменениях уведомим не менее чем за 14 дней. Продолжение использования означает принятие новых Условий.</p>
      </Section>
      <Section title="12. Применимое право">
        <p>Настоящие Условия регулируются законодательством <strong>Грузии</strong>. Споры — путём переговоров, при невозможности — в судах г. Батуми, Грузия.</p>
      </Section>
      <Section title="13. Контакты">
        <p><strong>Email:</strong> <Email /></p>
        <p><strong>Оператор:</strong> Maksym Olliinyk, г. Батуми, Грузия</p>
      </Section>
    </Article>
  );
}

/* ─── ENGLISH ─────────────────────────────────────────────── */
function ContentEN() {
  return (
    <Article title="Terms of Service" date="Last updated: March 1, 2026">
      <Section title="1. Acceptance of Terms">
        <p>By using Astraly (astraly.app), you agree to these Terms of Service. If you do not agree, please stop using the Service.</p>
        <p>Operator: <strong>Maksym Olliinyk</strong>, Batumi, Georgia. Contact: <Email /></p>
      </Section>
      <Section title="2. Service Description">
        <p>Astraly provides: natal chart calculation, AI interpretation, astro calendar, AI chat, daily horoscopes, and compatibility analysis.</p>
        <p className="font-medium text-[var(--foreground)] mt-4">Important Disclaimer</p>
        <p>The Service is provided solely for <strong>entertainment and educational purposes</strong>. Astrological interpretations are not medical, psychological, financial, or legal advice and should not be used as such.</p>
      </Section>
      <Section title="3. Age Requirements">
        <p>You must be at least <strong>13 years old</strong> to use the Service. You must be at least <strong>18 years old</strong> (or the age of majority in your country) to purchase a paid subscription. By creating an account, you confirm you meet these requirements.</p>
      </Section>
      <Section title="4. Account">
        <ul>
          <li>You are responsible for the security of your account and password</li>
          <li>Creating multiple accounts by one person is not permitted</li>
          <li>Sharing account access with third parties is prohibited</li>
          <li>If you suspect unauthorized access, change your password immediately and notify us</li>
        </ul>
      </Section>
      <Section title="5. Subscriptions and Payments">
        <ul>
          <li>Some features are available on the free plan</li>
          <li>Paid plans are billed monthly or annually</li>
          <li>Payments are processed by a third-party provider; we do not store your card data</li>
          <li>Subscriptions can be cancelled at any time; access continues until the end of the paid period</li>
          <li>Prices may change with 30 days notice</li>
        </ul>
      </Section>
      <Section title="6. Prohibited Use">
        <ul>
          <li>Using the Service for illegal purposes</li>
          <li>Attempting unauthorized access to systems or other users&apos; accounts</li>
          <li>Automated data extraction (scraping) without written permission</li>
          <li>Distributing malware</li>
          <li>Impersonating other individuals or organizations</li>
          <li>Reselling the Service without a written agreement with us</li>
        </ul>
      </Section>
      <Section title="7. Intellectual Property">
        <p>Astraly&apos;s design, content, code, and logo are protected by copyright. AI-generated content based on your data is provided for your personal, non-commercial use.</p>
      </Section>
      <Section title="8. Disclaimer of Warranties">
        <p>The Service is provided &ldquo;as is&rdquo;. We do not warrant the accuracy of astrological interpretations, uninterrupted operation, or that the Service will meet your expectations.</p>
      </Section>
      <Section title="9. Limitation of Liability">
        <p>To the maximum extent permitted by law, Astraly is not liable for indirect or consequential damages. Maximum liability is limited to amounts paid for the last 3 months of subscription.</p>
      </Section>
      <Section title="10. Termination">
        <p>We may suspend an account for violation of these Terms. You may delete your account at any time via settings or by writing to <Email />.</p>
      </Section>
      <Section title="11. Changes to Terms">
        <p>For significant changes we will notify you at least 14 days in advance. Continued use means acceptance of the updated Terms.</p>
      </Section>
      <Section title="12. Governing Law">
        <p>These Terms are governed by the laws of <strong>Georgia</strong>. Disputes will be resolved through negotiation; if not possible, in the courts of Batumi, Georgia.</p>
      </Section>
      <Section title="13. Contact">
        <p><strong>Email:</strong> <Email /></p>
        <p><strong>Operator:</strong> Maksym Olliinyk, Batumi, Georgia</p>
      </Section>
    </Article>
  );
}

/* ─── UKRAINIAN ───────────────────────────────────────────── */
function ContentUK() {
  return (
    <Article title="Умови використання" date="Останнє оновлення: 1 березня 2026 р.">
      <Section title="1. Прийняття умов">
        <p>Використовуючи сервіс Astraly (astraly.app), ви погоджуєтесь з цими Умовами. Якщо ви не згодні — будь ласка, припиніть використання Сервісу.</p>
        <p>Оператор: <strong>Maksym Olliinyk</strong>, м. Батумі, Грузія. Контакт: <Email /></p>
      </Section>
      <Section title="2. Опис Сервісу">
        <p>Astraly надає: розрахунок натальної карти, AI-інтерпретацію, астро-календар, AI-чат, щоденні гороскопи, аналіз сумісності.</p>
        <p className="font-medium text-[var(--foreground)] mt-4">Важливо</p>
        <p>Сервіс надається виключно з <strong>розважальною та пізнавальною метою</strong>. Астрологічні інтерпретації не є медичною, психологічною, фінансовою або юридичною порадою.</p>
      </Section>
      <Section title="3. Вік">
        <p>Для використання Сервісу — не менше <strong>13 років</strong>. Для оформлення платної підписки — не менше <strong>18 років</strong>. Створюючи акаунт, ви підтверджуєте відповідність цим вимогам.</p>
      </Section>
      <Section title="4. Акаунт">
        <ul>
          <li>Ви несете відповідальність за безпеку акаунту та пароля</li>
          <li>Створення кількох акаунтів однією особою не допускається</li>
          <li>Заборонено передавати доступ третім особам</li>
          <li>При підозрі на злам — негайно змініть пароль і напишіть нам</li>
        </ul>
      </Section>
      <Section title="5. Підписка та оплата">
        <ul>
          <li>Частина функцій доступна безкоштовно</li>
          <li>Платні плани тарифікуються щомісяця або щороку</li>
          <li>Оплата обробляється стороннім провайдером; дані картки ми не зберігаємо</li>
          <li>Підписку можна скасувати в будь-який момент; доступ зберігається до кінця оплаченого терміну</li>
          <li>Ціни можуть змінюватися з повідомленням за 30 днів</li>
        </ul>
      </Section>
      <Section title="6. Заборонене використання">
        <ul>
          <li>Використання в незаконних цілях</li>
          <li>Несанкціонований доступ до систем або акаунтів інших користувачів</li>
          <li>Автоматичне витягання даних без письмового дозволу</li>
          <li>Розповсюдження шкідливого ПЗ</li>
          <li>Видавання себе за інших осіб або організації</li>
          <li>Перепродаж Сервісу без письмової угоди з нами</li>
        </ul>
      </Section>
      <Section title="7. Інтелектуальна власність">
        <p>Дизайн, тексти, код і логотип Astraly захищені авторськими правами. Контент, що генерується AI на основі ваших даних, надається для особистого некомерційного використання.</p>
      </Section>
      <Section title="8. Відмова від гарантій">
        <p>Сервіс надається «як є». Ми не гарантуємо точність астрологічних інтерпретацій, безперебійну роботу або відповідність очікуванням.</p>
      </Section>
      <Section title="9. Обмеження відповідальності">
        <p>У максимальній мірі, допустимій законом, Astraly не несе відповідальності за непряму або наступну шкоду. Максимальна відповідальність — сума оплати за останні 3 місяці підписки.</p>
      </Section>
      <Section title="10. Припинення">
        <p>Ми вправі заблокувати акаунт при порушенні Умов. Ви можете видалити акаунт будь-коли через налаштування або написавши на <Email />.</p>
      </Section>
      <Section title="11. Зміни умов">
        <p>При суттєвих змінах повідомимо не менше ніж за 14 днів. Продовження використання означає прийняття нових Умов.</p>
      </Section>
      <Section title="12. Застосовне право">
        <p>Ці Умови регулюються законодавством <strong>Грузії</strong>. Суперечки — шляхом переговорів, у разі неможливості — у судах м. Батумі, Грузія.</p>
      </Section>
      <Section title="13. Контакти">
        <p><strong>Email:</strong> <Email /></p>
        <p><strong>Оператор:</strong> Maksym Olliinyk, м. Батумі, Грузія</p>
      </Section>
    </Article>
  );
}

/* ─── SHARED COMPONENTS ───────────────────────────────────── */
function Article({ title, date, children }: { title: string; date: string; children: React.ReactNode }) {
  return (
    <article className="text-[var(--foreground)]">
      <h1 className="text-3xl font-bold font-display mb-2">{title}</h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-10">{date}</p>
      {children}
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold font-display mb-4 text-[var(--foreground)]">{title}</h2>
      <div className="space-y-3 text-[var(--muted-foreground)] leading-relaxed [&_strong]:text-[var(--foreground)] [&_a]:transition-colors [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}

function Email() {
  return (
    <a href="mailto:support@astraly.app" className="text-cosmic-400 hover:underline">
      support@astraly.app
    </a>
  );
}
