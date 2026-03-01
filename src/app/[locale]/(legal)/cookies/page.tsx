import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика cookies",
  description: "Политика использования cookies на сайте Astraly",
};

export default function CookiesPage() {
  return (
    <article className="text-[var(--foreground)]">
      <h1 className="text-3xl font-bold font-display mb-2">
        Политика cookies
      </h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-10">
        Последнее обновление: 1 марта 2026 г.
      </p>

      <Section title="1. Что такое cookies">
        <p>
          Cookies — небольшие текстовые файлы, которые сохраняются в вашем
          браузере при посещении сайта. Они позволяют сайту запомнить ваши
          настройки и поддерживать вашу сессию (например, чтобы вы оставались
          авторизованы).
        </p>
        <p>
          Помимо cookies, мы используем <strong>localStorage</strong> — хранилище
          в вашем браузере — для записи ваших предпочтений (например, выбора темы
          оформления и согласия на cookies).
        </p>
      </Section>

      <Section title="2. Типы cookies, которые мы используем">
        <CookieCategory
          title="Необходимые cookies"
          badge="Всегда активны"
          badgeColor="text-green-400"
          description="Без этих cookies сервис не может работать. Они обеспечивают вход в аккаунт, безопасность сессии и базовые настройки. Отдельного согласия не требуют."
          cookies={[
            {
              name: "sb-* (Supabase)",
              purpose: "Сессия аутентификации",
              duration: "До выхода из аккаунта",
            },
            {
              name: "astraly-locale",
              purpose:
                "Запоминает выбранный язык при переходе через OAuth (Google)",
              duration: "5 минут",
            },
            {
              name: "astraly-cookie-consent",
              purpose: "Хранит ваш выбор по cookies (в localStorage)",
              duration: "Без ограничений (localStorage)",
            },
          ]}
        />

        <CookieCategory
          title="Аналитические cookies"
          badge="Не активны"
          badgeColor="text-[var(--muted-foreground)]"
          description="Планируем подключить Google Analytics для анализа того, как пользователи взаимодействуют с Сервисом. Это помогает улучшать продукт. Данные собираются анонимно и не позволяют идентифицировать вас лично. Будут активированы только с вашего явного согласия."
          cookies={[
            {
              name: "_ga, _ga_* (Google Analytics)",
              purpose:
                "Анонимная статистика посещений: страницы, источники трафика, поведение пользователей",
              duration: "До 2 лет",
            },
          ]}
        />

        <CookieCategory
          title="Рекламные cookies"
          badge="Не активны"
          badgeColor="text-[var(--muted-foreground)]"
          description="Планируем подключить Google Ads для измерения эффективности рекламных кампаний. Эти cookies позволяют Google показывать вам релевантную рекламу на других сайтах. Будут активированы только с вашего явного согласия."
          cookies={[
            {
              name: "_gcl_au (Google Ads)",
              purpose:
                "Отслеживание конверсий рекламных кампаний Google",
              duration: "90 дней",
            },
          ]}
        />
      </Section>

      <Section title="3. Управление cookies">
        <p>У вас есть несколько способов управлять cookies:</p>

        <p className="font-medium text-[var(--foreground)] mt-4">
          Через баннер Сервиса
        </p>
        <p>
          При первом посещении сайта мы показываем баннер, в котором вы можете
          выбрать «Только необходимые» или «Принять все». Ваш выбор сохраняется
          в localStorage под ключом <code className="text-cosmic-400 text-sm">astraly-cookie-consent</code>.
        </p>

        <p className="font-medium text-[var(--foreground)] mt-4">
          Через настройки браузера
        </p>
        <p>
          Вы можете блокировать или удалять cookies через настройки вашего
          браузера. Инструкции для популярных браузеров:
        </p>
        <ul>
          <li>
            <strong>Chrome:</strong> Настройки → Конфиденциальность и
            безопасность → Файлы cookie
          </li>
          <li>
            <strong>Firefox:</strong> Настройки → Конфиденциальность и защита
          </li>
          <li>
            <strong>Safari:</strong> Настройки → Конфиденциальность
          </li>
          <li>
            <strong>Edge:</strong> Настройки → Файлы cookie и разрешения сайта
          </li>
        </ul>
        <p>
          Обратите внимание: блокировка необходимых cookies нарушит работу
          Сервиса — вы не сможете авторизоваться.
        </p>

        <p className="font-medium text-[var(--foreground)] mt-4">
          Режим инкогнито
        </p>
        <p>
          В режиме инкогнито cookies не сохраняются между сессиями браузера.
        </p>

        <p className="font-medium text-[var(--foreground)] mt-4">
          Сброс выбора
        </p>
        <p>
          Чтобы изменить ваш выбор, удалите значение{" "}
          <code className="text-cosmic-400 text-sm">astraly-cookie-consent</code>{" "}
          из localStorage браузера (DevTools → Application → Local Storage).
          После этого баннер появится снова.
        </p>
      </Section>

      <Section title="4. Ссылки">
        <ul>
          <li>
            <a href="../privacy" className="text-cosmic-400 hover:underline">
              Политика конфиденциальности
            </a>{" "}
            — подробнее о том, как мы обрабатываем персональные данные
          </li>
          <li>
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cosmic-400 hover:underline"
            >
              Политика конфиденциальности Google
            </a>
          </li>
        </ul>
        <p>
          По вопросам:{" "}
          <a
            href="mailto:support@astraly.app"
            className="text-cosmic-400 hover:underline"
          >
            support@astraly.app
          </a>
        </p>
      </Section>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold font-display mb-4 text-[var(--foreground)]">
        {title}
      </h2>
      <div className="space-y-3 text-[var(--muted-foreground)] leading-relaxed [&_strong]:text-[var(--foreground)] [&_a]:transition-colors [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}

function CookieCategory({
  title,
  badge,
  badgeColor,
  description,
  cookies,
}: {
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
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
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left py-1.5 pr-4 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]/70">
                Cookie
              </th>
              <th className="text-left py-1.5 pr-4 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]/70">
                Назначение
              </th>
              <th className="text-left py-1.5 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]/70">
                Срок
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {cookies.map((c) => (
              <tr key={c.name}>
                <td className="py-2 pr-4 font-mono text-xs text-cosmic-400">
                  {c.name}
                </td>
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
