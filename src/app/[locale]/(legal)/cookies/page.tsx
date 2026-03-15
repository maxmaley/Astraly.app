import type { Metadata } from "next";

const titles = { ru: "Политика cookies", en: "Cookie Policy", uk: "Політика cookies", pl: "Polityka cookies" };

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const l = params.locale as keyof typeof titles;
  return { title: titles[l] ?? titles.ru };
}

export default function CookiesPage({ params }: { params: { locale: string } }) {
  if (params.locale === "en") return <ContentEN />;
  if (params.locale === "uk") return <ContentUK />;
  return <ContentRU />;
}

/* ─── RUSSIAN ─────────────────────────────────────────────── */
function ContentRU() {
  return (
    <Article title="Политика cookies" date="Последнее обновление: 1 марта 2026 г.">
      <Section title="1. Что такое cookies">
        <p>Cookies — небольшие текстовые файлы, которые сохраняются в вашем браузере при посещении сайта. Они позволяют сайту запомнить настройки и поддерживать сессию.</p>
        <p>Помимо cookies, мы используем <strong>localStorage</strong> — хранилище в вашем браузере — для записи предпочтений (тема, согласие на cookies).</p>
      </Section>
      <Section title="2. Типы cookies, которые мы используем">
        <CookieCategory title="Необходимые cookies" badge="Всегда активны" badgeColor="text-green-400"
          description="Без этих cookies сервис не может работать. Они обеспечивают вход в аккаунт и базовые настройки. Согласия не требуют."
          cookies={[
            { name: "sb-* (Supabase)", purpose: "Сессия аутентификации", duration: "До выхода" },
            { name: "astraly-locale", purpose: "Язык интерфейса при OAuth-переходе", duration: "5 минут" },
            { name: "astraly-cookie-consent", purpose: "Ваш выбор по cookies (localStorage)", duration: "Постоянно" },
          ]} />
        <CookieCategory title="Аналитические cookies" badge="Не активны" badgeColor="text-[var(--muted-foreground)]"
          description="Планируем подключить Google Analytics для анализа использования Сервиса. Будут активированы только с вашего согласия."
          cookies={[
            { name: "_ga, _ga_*", purpose: "Анонимная статистика посещений", duration: "До 2 лет" },
          ]} />
        <CookieCategory title="Рекламные cookies" badge="Не активны" badgeColor="text-[var(--muted-foreground)]"
          description="Планируем подключить Google Ads. Будут активированы только с вашего явного согласия."
          cookies={[
            { name: "_gcl_au (Google Ads)", purpose: "Отслеживание конверсий рекламы", duration: "90 дней" },
          ]} />
      </Section>
      <Section title="3. Управление cookies">
        <p className="font-medium text-[var(--foreground)]">Через баннер Сервиса</p>
        <p>При первом посещении выберите «Только необходимые» или «Принять все». Ваш выбор сохраняется в localStorage под ключом <code className="text-cosmic-400 text-sm">astraly-cookie-consent</code>.</p>
        <p className="font-medium text-[var(--foreground)] mt-4">Через настройки браузера</p>
        <ul>
          <li><strong>Chrome:</strong> Настройки → Конфиденциальность → Файлы cookie</li>
          <li><strong>Firefox:</strong> Настройки → Конфиденциальность и защита</li>
          <li><strong>Safari:</strong> Настройки → Конфиденциальность</li>
          <li><strong>Edge:</strong> Настройки → Файлы cookie и разрешения</li>
        </ul>
        <p>Блокировка необходимых cookies нарушит работу Сервиса.</p>
        <p className="font-medium text-[var(--foreground)] mt-4">Сброс выбора</p>
        <p>Удалите <code className="text-cosmic-400 text-sm">astraly-cookie-consent</code> из localStorage (DevTools → Application → Local Storage) — баннер появится снова.</p>
      </Section>
      <Section title="4. Ссылки">
        <ul>
          <li><a href="../privacy" className="text-cosmic-400 hover:underline">Политика конфиденциальности</a></li>
          <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cosmic-400 hover:underline">Политика конфиденциальности Google</a></li>
        </ul>
        <p>По вопросам: <Email /></p>
      </Section>
    </Article>
  );
}

/* ─── ENGLISH ─────────────────────────────────────────────── */
function ContentEN() {
  return (
    <Article title="Cookie Policy" date="Last updated: March 1, 2026">
      <Section title="1. What Are Cookies">
        <p>Cookies are small text files stored in your browser when you visit a website. They allow the site to remember your preferences and maintain your session.</p>
        <p>In addition to cookies, we use <strong>localStorage</strong> — browser storage — to save preferences such as theme choice and cookie consent.</p>
      </Section>
      <Section title="2. Types of Cookies We Use">
        <CookieCategory title="Necessary Cookies" badge="Always active" badgeColor="text-green-400"
          description="These cookies are required for the Service to function. They enable login and basic settings. No consent required."
          cookies={[
            { name: "sb-* (Supabase)", purpose: "Authentication session", duration: "Until logout" },
            { name: "astraly-locale", purpose: "Interface language during OAuth redirect", duration: "5 minutes" },
            { name: "astraly-cookie-consent", purpose: "Your cookie preferences (localStorage)", duration: "Permanent" },
          ]} />
        <CookieCategory title="Analytics Cookies" badge="Inactive" badgeColor="text-[var(--muted-foreground)]"
          description="We plan to connect Google Analytics to analyze Service usage. Will be activated only with your explicit consent."
          cookies={[
            { name: "_ga, _ga_*", purpose: "Anonymous visit statistics", duration: "Up to 2 years" },
          ]} />
        <CookieCategory title="Marketing Cookies" badge="Inactive" badgeColor="text-[var(--muted-foreground)]"
          description="We plan to connect Google Ads. Will be activated only with your explicit consent."
          cookies={[
            { name: "_gcl_au (Google Ads)", purpose: "Advertising conversion tracking", duration: "90 days" },
          ]} />
      </Section>
      <Section title="3. Managing Cookies">
        <p className="font-medium text-[var(--foreground)]">Through the Service banner</p>
        <p>On your first visit, choose &ldquo;Necessary only&rdquo; or &ldquo;Accept all&rdquo;. Your choice is saved in localStorage under the key <code className="text-cosmic-400 text-sm">astraly-cookie-consent</code>.</p>
        <p className="font-medium text-[var(--foreground)] mt-4">Through browser settings</p>
        <ul>
          <li><strong>Chrome:</strong> Settings → Privacy → Cookies</li>
          <li><strong>Firefox:</strong> Preferences → Privacy & Security</li>
          <li><strong>Safari:</strong> Preferences → Privacy</li>
          <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
        </ul>
        <p>Blocking necessary cookies will prevent the Service from working correctly.</p>
        <p className="font-medium text-[var(--foreground)] mt-4">Reset your choice</p>
        <p>Delete <code className="text-cosmic-400 text-sm">astraly-cookie-consent</code> from localStorage (DevTools → Application → Local Storage) and the banner will appear again.</p>
      </Section>
      <Section title="4. Links">
        <ul>
          <li><a href="../privacy" className="text-cosmic-400 hover:underline">Privacy Policy</a></li>
          <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cosmic-400 hover:underline">Google Privacy Policy</a></li>
        </ul>
        <p>Questions: <Email /></p>
      </Section>
    </Article>
  );
}

/* ─── UKRAINIAN ───────────────────────────────────────────── */
function ContentUK() {
  return (
    <Article title="Політика cookies" date="Останнє оновлення: 1 березня 2026 р.">
      <Section title="1. Що таке cookies">
        <p>Cookies — невеликі текстові файли, що зберігаються у вашому браузері під час відвідування сайту. Вони дозволяють сайту запам&apos;ятати налаштування та підтримувати сесію.</p>
        <p>Крім cookies, ми використовуємо <strong>localStorage</strong> — сховище у вашому браузері — для запису вподобань (тема, згода на cookies).</p>
      </Section>
      <Section title="2. Типи cookies, які ми використовуємо">
        <CookieCategory title="Необхідні cookies" badge="Завжди активні" badgeColor="text-green-400"
          description="Без цих cookies сервіс не може працювати. Вони забезпечують вхід в акаунт і базові налаштування. Згоди не потребують."
          cookies={[
            { name: "sb-* (Supabase)", purpose: "Сесія автентифікації", duration: "До виходу" },
            { name: "astraly-locale", purpose: "Мова інтерфейсу при OAuth-переході", duration: "5 хвилин" },
            { name: "astraly-cookie-consent", purpose: "Ваш вибір щодо cookies (localStorage)", duration: "Постійно" },
          ]} />
        <CookieCategory title="Аналітичні cookies" badge="Не активні" badgeColor="text-[var(--muted-foreground)]"
          description="Плануємо підключити Google Analytics для аналізу використання Сервісу. Будуть активовані лише з вашої згоди."
          cookies={[
            { name: "_ga, _ga_*", purpose: "Анонімна статистика відвідувань", duration: "До 2 років" },
          ]} />
        <CookieCategory title="Рекламні cookies" badge="Не активні" badgeColor="text-[var(--muted-foreground)]"
          description="Плануємо підключити Google Ads. Будуть активовані лише з вашої явної згоди."
          cookies={[
            { name: "_gcl_au (Google Ads)", purpose: "Відстеження конверсій реклами", duration: "90 днів" },
          ]} />
      </Section>
      <Section title="3. Управління cookies">
        <p className="font-medium text-[var(--foreground)]">Через банер Сервісу</p>
        <p>При першому відвідуванні оберіть «Лише необхідні» або «Прийняти всі». Ваш вибір зберігається в localStorage під ключем <code className="text-cosmic-400 text-sm">astraly-cookie-consent</code>.</p>
        <p className="font-medium text-[var(--foreground)] mt-4">Через налаштування браузера</p>
        <ul>
          <li><strong>Chrome:</strong> Налаштування → Конфіденційність → Файли cookie</li>
          <li><strong>Firefox:</strong> Налаштування → Приватність і захист</li>
          <li><strong>Safari:</strong> Налаштування → Конфіденційність</li>
          <li><strong>Edge:</strong> Налаштування → Файли cookie та дозволи</li>
        </ul>
        <p>Блокування необхідних cookies порушить роботу Сервісу.</p>
        <p className="font-medium text-[var(--foreground)] mt-4">Скидання вибору</p>
        <p>Видаліть <code className="text-cosmic-400 text-sm">astraly-cookie-consent</code> з localStorage (DevTools → Application → Local Storage) — банер з&apos;явиться знову.</p>
      </Section>
      <Section title="4. Посилання">
        <ul>
          <li><a href="../privacy" className="text-cosmic-400 hover:underline">Політика конфіденційності</a></li>
          <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cosmic-400 hover:underline">Політика конфіденційності Google</a></li>
        </ul>
        <p>З питань: <Email /></p>
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

function CookieCategory({ title, badge, badgeColor, description, cookies }: {
  title: string; badge: string; badgeColor: string; description: string;
  cookies: { name: string; purpose: string; duration: string }[];
}) {
  return (
    <div className="mb-6 rounded-lg border border-[var(--border)] p-4">
      <div className="flex items-center gap-3 mb-2">
        <h3 className="font-medium text-[var(--foreground)]">{title}</h3>
        <span className={`text-xs font-medium ${badgeColor}`}>● {badge}</span>
      </div>
      <p className="text-sm mb-4">{description}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <tbody className="divide-y divide-[var(--border)]">
            {cookies.map((c) => (
              <tr key={c.name}>
                <td className="py-2 pr-4 font-mono text-xs text-cosmic-400 whitespace-nowrap">{c.name}</td>
                <td className="py-2 pr-4">{c.purpose}</td>
                <td className="py-2 whitespace-nowrap">{c.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
