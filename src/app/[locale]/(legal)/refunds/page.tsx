import type { Metadata } from "next";

const titles = {
  ru: "Политика возврата средств",
  en: "Refund Policy",
  uk: "Політика повернення коштів",
};

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const l = params.locale as keyof typeof titles;
  return { title: titles[l] ?? titles.ru };
}

export default function RefundsPage({ params }: { params: { locale: string } }) {
  if (params.locale === "en") return <ContentEN />;
  if (params.locale === "uk") return <ContentUK />;
  return <ContentRU />;
}

/* ─── RUSSIAN ─────────────────────────────────────────────── */
function ContentRU() {
  return (
    <Article title="Политика возврата средств" date="Последнее обновление: 1 марта 2026 г.">
      <Section title="1. Общее правило">
        <p>После оплаты подписки <strong>возврат за текущий оплаченный период не предусмотрен</strong>.</p>
        <p>При отмене подписки доступ к платным функциям сохраняется до конца оплаченного периода. Повторного списания не происходит.</p>
      </Section>
      <Section title="2. Когда возврат возможен">
        <ul>
          <li><strong>Технический сбой:</strong> Сервис был недоступен более 72 часов подряд по нашей вине</li>
          <li><strong>Двойное списание:</strong> с вас ошибочно списали средства дважды за один период</li>
          <li><strong>Несанкционированное списание:</strong> платёж произведён без вашего ведома</li>
          <li><strong>Требования законодательства:</strong> если ваша страна предусматривает обязательное право на возврат — мы его соблюдаем</li>
        </ul>
      </Section>
      <Section title="3. Как запросить возврат">
        <p>Напишите на <Email /> и укажите:</p>
        <ul>
          <li>Email вашего аккаунта</li>
          <li>Дату списания и сумму</li>
          <li>Причину запроса</li>
        </ul>
        <p>Рассмотрим в течение <strong>5 рабочих дней</strong>. Одобренный возврат поступит на счёт в течение 5–10 рабочих дней.</p>
      </Section>
      <Section title="4. Годовые подписки">
        <p>Если вы оформили годовую подписку и обращаетесь в первые <strong>14 дней</strong> после первого списания — напишите нам, рассмотрим пропорциональный возврат за неиспользованные месяцы.</p>
      </Section>
      <Section title="5. Контакты">
        <p><strong>Email:</strong> <Email /></p>
        <p><strong>Оператор:</strong> Maksym Olliinyk, г. Батуми, Грузия</p>
      </Section>
    </Article>
  );
}

/* ─── ENGLISH ─────────────────────────────────────────────── */
function ContentEN() {
  return (
    <Article title="Refund Policy" date="Last updated: March 1, 2026">
      <Section title="1. General Policy">
        <p>Once a payment is processed, <strong>refunds for the current paid period are not provided</strong>.</p>
        <p>When you cancel your subscription, access to paid features continues until the end of the paid period. No further charges occur.</p>
      </Section>
      <Section title="2. When a Refund Is Possible">
        <ul>
          <li><strong>Technical outage:</strong> the Service was unavailable for more than 72 consecutive hours due to our fault</li>
          <li><strong>Duplicate charge:</strong> you were charged twice for the same period by mistake</li>
          <li><strong>Unauthorized charge:</strong> a payment was made without your knowledge</li>
          <li><strong>Applicable law:</strong> if your country requires a statutory right to a refund, we comply</li>
        </ul>
      </Section>
      <Section title="3. How to Request a Refund">
        <p>Email us at <Email /> and include:</p>
        <ul>
          <li>Your account email</li>
          <li>Payment date and amount</li>
          <li>Reason for the request</li>
        </ul>
        <p>We will review your request within <strong>5 business days</strong>. Approved refunds are returned to your account within 5–10 business days depending on your bank.</p>
      </Section>
      <Section title="4. Annual Subscriptions">
        <p>If you purchased an annual plan and contact us within the first <strong>14 days</strong> of the initial charge, we will review your request for a pro-rated refund for unused months.</p>
      </Section>
      <Section title="5. Contact">
        <p><strong>Email:</strong> <Email /></p>
        <p><strong>Operator:</strong> Maksym Olliinyk, Batumi, Georgia</p>
      </Section>
    </Article>
  );
}

/* ─── UKRAINIAN ───────────────────────────────────────────── */
function ContentUK() {
  return (
    <Article title="Політика повернення коштів" date="Останнє оновлення: 1 березня 2026 р.">
      <Section title="1. Загальне правило">
        <p>Після оплати підписки <strong>повернення за поточний оплачений період не передбачено</strong>.</p>
        <p>При скасуванні підписки доступ до платних функцій зберігається до кінця оплаченого терміну. Повторного списання не відбувається.</p>
      </Section>
      <Section title="2. Коли повернення можливе">
        <ul>
          <li><strong>Технічний збій:</strong> Сервіс був недоступний більше 72 годин поспіль з нашої вини</li>
          <li><strong>Подвійне списання:</strong> з вас помилково списали кошти двічі за один період</li>
          <li><strong>Несанкціоноване списання:</strong> платіж здійснено без вашого відома</li>
          <li><strong>Вимоги законодавства:</strong> якщо ваша країна передбачає обов&apos;язкове право на повернення — ми його дотримуємося</li>
        </ul>
      </Section>
      <Section title="3. Як запросити повернення">
        <p>Напишіть на <Email /> і вкажіть:</p>
        <ul>
          <li>Email вашого акаунту</li>
          <li>Дату списання та суму</li>
          <li>Причину запиту</li>
        </ul>
        <p>Розглянемо протягом <strong>5 робочих днів</strong>. Схвалене повернення надійде на рахунок протягом 5–10 робочих днів.</p>
      </Section>
      <Section title="4. Річні підписки">
        <p>Якщо ви оформили річний план і звертаєтеся протягом перших <strong>14 днів</strong> після першого списання — напишіть нам, розглянемо пропорційне повернення за невикористані місяці.</p>
      </Section>
      <Section title="5. Контакти">
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
