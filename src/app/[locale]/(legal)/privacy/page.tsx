import type { Metadata } from "next";

const titles = {
  ru: "Политика конфиденциальности",
  en: "Privacy Policy",
  uk: "Політика конфіденційності",
};
const descriptions = {
  ru: "Политика конфиденциальности сервиса Astraly",
  en: "Privacy Policy of the Astraly service",
  uk: "Політика конфіденційності сервісу Astraly",
};

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const l = params.locale as keyof typeof titles;
  return { title: titles[l] ?? titles.ru, description: descriptions[l] ?? descriptions.ru };
}

export default function PrivacyPage({ params }: { params: { locale: string } }) {
  if (params.locale === "en") return <ContentEN />;
  if (params.locale === "uk") return <ContentUK />;
  return <ContentRU />;
}

/* ─── RUSSIAN ─────────────────────────────────────────────── */
function ContentRU() {
  return (
    <Article title="Политика конфиденциальности" date="Последнее обновление: 1 марта 2026 г.">
      <Section title="1. Общие положения">
        <p>Astraly («Сервис», «мы») — астрологический веб-сервис по адресу astraly.app, управляемый физическим лицом <strong>Maksym Olliinyk</strong>, г. Батуми, Грузия.</p>
        <p>Мы серьёзно относимся к вашей конфиденциальности. Настоящая Политика объясняет, какие данные мы собираем, как используем их и какие права у вас есть.</p>
        <p>По всем вопросам: <Email /></p>
      </Section>
      <Section title="2. Какие данные мы собираем">
        <Sub>Данные для регистрации и входа</Sub>
        <ul><li>Адрес электронной почты</li><li>Пароль (хранится зашифрованным; мы не имеем к нему доступа)</li><li>Данные Google-аккаунта при OAuth: имя, email, фото</li></ul>
        <Sub>Астрологические данные</Sub>
        <ul><li>Имя (отображаемое)</li><li>Дата рождения</li><li>Время рождения (необязательно)</li><li>Город рождения</li><li>Географические координаты (вычисляются автоматически по городу)</li></ul>
        <p>Эти данные необходимы для расчёта натальной карты — основной функции Сервиса.</p>
        <Sub>Данные об использовании</Sub>
        <ul><li>История чатов с AI-астрологом</li><li>Выбранный план подписки и статус оплаты</li><li>Настройки аккаунта (язык, тема, уведомления)</li></ul>
        <Sub>Технические данные</Sub>
        <ul><li>Файлы сессии (cookies) для аутентификации</li><li>IP-адрес (сохраняется поставщиком облачной инфраструктуры)</li><li>Информация о браузере и устройстве</li></ul>
      </Section>
      <Section title="3. Как мы используем ваши данные">
        <ul>
          <li><strong>Предоставление Сервиса:</strong> расчёт карты, гороскопы, ответы AI</li>
          <li><strong>Управление аккаунтом:</strong> аутентификация, настройки</li>
          <li><strong>Обработка платежей:</strong> передача данных Paddle (карты мы не храним)</li>
          <li><strong>Улучшение Сервиса:</strong> агрегированная аналитика (в будущем — Google Analytics)</li>
          <li><strong>Уведомления:</strong> email при включённых настройках</li>
        </ul>
      </Section>
      <Section title="4. Правовые основания (GDPR)">
        <ul>
          <li><strong>Договор:</strong> данные для предоставления Сервиса</li>
          <li><strong>Законный интерес:</strong> безопасность, защита от мошенничества</li>
          <li><strong>Согласие:</strong> аналитические и рекламные cookies (отзывается в любой момент)</li>
        </ul>
      </Section>
      <Section title="5. Третьи лица">
        <p>Мы используем следующих поставщиков, соблюдающих требования GDPR:</p>
        <ThirdPartyTable rows={[
          ["Supabase", "База данных, аутентификация", "США"],
          ["Anthropic (Claude AI)", "Ответы AI-астролога", "США"],
          ["Google (OAuth)", "Авторизация через Google", "США"],
          ["Google Analytics", "Аналитика (не активна)", "США"],
          ["Google Ads", "Реклама (не активна)", "США"],
          ["Paddle", "Обработка платежей", "Великобритания"],
          ["Resend", "Email-уведомления", "США"],
        ]} headers={["Поставщик", "Назначение", "Страна"]} />
      </Section>
      <Section title="6. Cookies">
        <p>Подробнее — в <a href="../cookies" className="text-cosmic-400 hover:underline">Политике cookies</a>. Кратко:</p>
        <ul>
          <li><strong>Необходимые:</strong> сессия и языковые настройки — без них Сервис не работает</li>
          <li><strong>Аналитические (не активны):</strong> Google Analytics</li>
          <li><strong>Рекламные (не активны):</strong> Google Ads — только с вашего согласия</li>
        </ul>
      </Section>
      <Section title="7. Ваши права">
        <ul>
          <li><strong>Доступ:</strong> получить копию данных</li>
          <li><strong>Исправление:</strong> обновить неточные данные</li>
          <li><strong>Удаление:</strong> запросить удаление аккаунта и всех данных</li>
          <li><strong>Переносимость:</strong> получить данные в машиночитаемом формате</li>
          <li><strong>Ограничение:</strong> приостановить обработку</li>
          <li><strong>Возражение:</strong> возразить против обработки на основе законного интереса</li>
          <li><strong>Отзыв согласия:</strong> отозвать согласие на cookies</li>
        </ul>
        <p>Для реализации прав: <Email /> — ответим в течение 30 дней.</p>
      </Section>
      <Section title="8. Хранение данных">
        <ul>
          <li>Данные аккаунта — пока аккаунт активен</li>
          <li>История чатов — до 2 лет с последнего использования</li>
          <li>При удалении аккаунта — все данные удаляются в течение 30 дней</li>
        </ul>
      </Section>
      <Section title="9. Безопасность">
        <ul>
          <li>Шифрование при передаче (HTTPS/TLS)</li>
          <li>Шифрование паролей (bcrypt)</li>
          <li>Изолированная база данных с контролем доступа</li>
        </ul>
      </Section>
      <Section title="10. Дети">
        <p>Сервис предназначен для лиц от 13 лет. Мы не собираем данные детей младше 13 лет намеренно.</p>
      </Section>
      <Section title="11. Изменения">
        <p>При существенных изменениях уведомим по email или в Сервисе. Продолжение использования означает согласие с новой редакцией.</p>
      </Section>
      <Section title="12. Контакты">
        <p><strong>Email:</strong> <Email /></p>
        <p><strong>Оператор:</strong> Maksym Olliinyk, г. Батуми, Грузия</p>
      </Section>
    </Article>
  );
}

/* ─── ENGLISH ─────────────────────────────────────────────── */
function ContentEN() {
  return (
    <Article title="Privacy Policy" date="Last updated: March 1, 2026">
      <Section title="1. General Information">
        <p>Astraly (&ldquo;Service&rdquo;, &ldquo;we&rdquo;) is an astrology web service at astraly.app, operated by individual <strong>Maksym Olliinyk</strong>, Batumi, Georgia.</p>
        <p>We take your privacy seriously. This Policy explains what data we collect, how we use it, and what rights you have regarding your data.</p>
        <p>For all privacy-related questions: <Email /></p>
      </Section>
      <Section title="2. What Data We Collect">
        <Sub>Registration and Login Data</Sub>
        <ul><li>Email address</li><li>Password (stored encrypted; we have no access to it)</li><li>Google account data when using OAuth: name, email, profile photo</li></ul>
        <Sub>Astrological Data</Sub>
        <ul><li>Name (display name)</li><li>Date of birth</li><li>Time of birth (optional)</li><li>City of birth</li><li>Geographic coordinates (automatically calculated from city for chart calculation)</li></ul>
        <p>This data is required for natal chart calculation — the core function of the Service.</p>
        <Sub>Usage Data</Sub>
        <ul><li>Chat history with AI astrologer</li><li>Selected subscription plan and payment status</li><li>Account settings (language, theme, notifications)</li></ul>
        <Sub>Technical Data</Sub>
        <ul><li>Session cookies for authentication</li><li>IP address (stored by cloud infrastructure provider automatically)</li><li>Browser and device information (standard HTTP headers)</li></ul>
      </Section>
      <Section title="3. How We Use Your Data">
        <ul>
          <li><strong>Providing the Service:</strong> natal chart calculation, horoscopes, AI responses</li>
          <li><strong>Account management:</strong> authentication, saving settings</li>
          <li><strong>Payment processing:</strong> transmitting required data to Paddle (we don&apos;t store card data)</li>
          <li><strong>Service improvement:</strong> aggregated usage analytics (in the future — via Google Analytics)</li>
          <li><strong>Notifications:</strong> email when corresponding settings are enabled</li>
        </ul>
      </Section>
      <Section title="4. Legal Basis (GDPR)">
        <ul>
          <li><strong>Contract:</strong> data necessary to provide the Service</li>
          <li><strong>Legitimate interest:</strong> security, fraud protection</li>
          <li><strong>Consent:</strong> analytics and marketing cookies (can be withdrawn at any time)</li>
        </ul>
      </Section>
      <Section title="5. Third Parties">
        <p>We use the following providers, all compliant with GDPR requirements:</p>
        <ThirdPartyTable rows={[
          ["Supabase", "Database, authentication", "USA"],
          ["Anthropic (Claude AI)", "AI astrologer responses", "USA"],
          ["Google (OAuth)", "Google sign-in", "USA"],
          ["Google Analytics", "Usage analytics (inactive)", "USA"],
          ["Google Ads", "Advertising (inactive)", "USA"],
          ["Paddle", "Payment processing", "UK"],
          ["Resend", "Email notifications", "USA"],
        ]} headers={["Provider", "Purpose", "Country"]} />
      </Section>
      <Section title="6. Cookies">
        <p>See our <a href="../cookies" className="text-cosmic-400 hover:underline">Cookie Policy</a> for details. In brief:</p>
        <ul>
          <li><strong>Necessary:</strong> session and language preferences — the Service cannot function without them</li>
          <li><strong>Analytics (inactive):</strong> Google Analytics</li>
          <li><strong>Marketing (inactive):</strong> Google Ads — activated only with your explicit consent</li>
        </ul>
      </Section>
      <Section title="7. Your Rights">
        <ul>
          <li><strong>Access:</strong> request a copy of your personal data</li>
          <li><strong>Rectification:</strong> update inaccurate data via account settings</li>
          <li><strong>Erasure:</strong> request deletion of account and all associated data</li>
          <li><strong>Portability:</strong> receive your data in machine-readable format</li>
          <li><strong>Restriction:</strong> request suspension of data processing</li>
          <li><strong>Objection:</strong> object to processing based on legitimate interest</li>
          <li><strong>Withdrawal of consent:</strong> withdraw consent for cookies at any time</li>
        </ul>
        <p>To exercise your rights, write to <Email /> — we will respond within 30 days.</p>
      </Section>
      <Section title="8. Data Retention">
        <ul>
          <li>Account data is stored while the account is active</li>
          <li>Chat history: up to 2 years from last account use</li>
          <li>Upon account deletion, all personal data is deleted within 30 days</li>
        </ul>
      </Section>
      <Section title="9. Security">
        <ul>
          <li>Encryption in transit (HTTPS/TLS)</li>
          <li>Password hashing (bcrypt)</li>
          <li>Isolated database with access control</li>
        </ul>
      </Section>
      <Section title="10. Children">
        <p>The Service is intended for persons aged 13 and older. We do not intentionally collect data from children under 13.</p>
      </Section>
      <Section title="11. Changes">
        <p>For significant changes we will notify you by email or in the Service. Continued use means acceptance of the updated Policy.</p>
      </Section>
      <Section title="12. Contact">
        <p><strong>Email:</strong> <Email /></p>
        <p><strong>Operator:</strong> Maksym Olliinyk, Batumi, Georgia</p>
      </Section>
    </Article>
  );
}

/* ─── UKRAINIAN ───────────────────────────────────────────── */
function ContentUK() {
  return (
    <Article title="Політика конфіденційності" date="Останнє оновлення: 1 березня 2026 р.">
      <Section title="1. Загальні положення">
        <p>Astraly («Сервіс», «ми») — астрологічний вебсервіс за адресою astraly.app, яким керує фізична особа <strong>Maksym Olliinyk</strong>, м. Батумі, Грузія.</p>
        <p>Ми серйозно ставимося до вашої конфіденційності. Ця Політика пояснює, які дані ми збираємо, як їх використовуємо та які у вас є права.</p>
        <p>З усіх питань: <Email /></p>
      </Section>
      <Section title="2. Які дані ми збираємо">
        <Sub>Дані для реєстрації та входу</Sub>
        <ul><li>Адреса електронної пошти</li><li>Пароль (зберігається у зашифрованому вигляді; ми не маємо до нього доступу)</li><li>Дані Google-акаунту при OAuth: ім&apos;я, email, фото</li></ul>
        <Sub>Астрологічні дані</Sub>
        <ul><li>Ім&apos;я (відображуване)</li><li>Дата народження</li><li>Час народження (необов&apos;язково)</li><li>Місто народження</li><li>Географічні координати (обчислюються автоматично за містом)</li></ul>
        <p>Ці дані необхідні для розрахунку натальної карти — основної функції Сервісу.</p>
        <Sub>Дані про використання</Sub>
        <ul><li>Історія чатів з AI-астрологом</li><li>Обраний план підписки та статус оплати</li><li>Налаштування акаунту (мова, тема, сповіщення)</li></ul>
        <Sub>Технічні дані</Sub>
        <ul><li>Файли сесії (cookies) для автентифікації</li><li>IP-адреса (зберігається постачальником хмарної інфраструктури)</li><li>Інформація про браузер і пристрій</li></ul>
      </Section>
      <Section title="3. Як ми використовуємо ваші дані">
        <ul>
          <li><strong>Надання Сервісу:</strong> розрахунок карти, гороскопи, відповіді AI</li>
          <li><strong>Управління акаунтом:</strong> автентифікація, налаштування</li>
          <li><strong>Обробка платежів:</strong> передача даних Paddle (картки ми не зберігаємо)</li>
          <li><strong>Покращення Сервісу:</strong> агрегована аналітика (у майбутньому — Google Analytics)</li>
          <li><strong>Сповіщення:</strong> email при ввімкнених налаштуваннях</li>
        </ul>
      </Section>
      <Section title="4. Правові підстави (GDPR)">
        <ul>
          <li><strong>Договір:</strong> дані для надання Сервісу</li>
          <li><strong>Законний інтерес:</strong> безпека, захист від шахрайства</li>
          <li><strong>Згода:</strong> аналітичні та рекламні cookies (відкликається в будь-який момент)</li>
        </ul>
      </Section>
      <Section title="5. Треті особи">
        <p>Ми використовуємо таких постачальників, що відповідають вимогам GDPR:</p>
        <ThirdPartyTable rows={[
          ["Supabase", "База даних, автентифікація", "США"],
          ["Anthropic (Claude AI)", "Відповіді AI-астролога", "США"],
          ["Google (OAuth)", "Авторизація через Google", "США"],
          ["Google Analytics", "Аналітика (не активна)", "США"],
          ["Google Ads", "Реклама (не активна)", "США"],
          ["Paddle", "Обробка платежів", "Великобританія"],
          ["Resend", "Email-сповіщення", "США"],
        ]} headers={["Постачальник", "Призначення", "Країна"]} />
      </Section>
      <Section title="6. Cookies">
        <p>Детальніше — у нашій <a href="../cookies" className="text-cosmic-400 hover:underline">Політиці cookies</a>. Коротко:</p>
        <ul>
          <li><strong>Необхідні:</strong> сесія та мовні налаштування — без них Сервіс не працює</li>
          <li><strong>Аналітичні (не активні):</strong> Google Analytics</li>
          <li><strong>Рекламні (не активні):</strong> Google Ads — лише з вашої явної згоди</li>
        </ul>
      </Section>
      <Section title="7. Ваші права">
        <ul>
          <li><strong>Доступ:</strong> отримати копію даних</li>
          <li><strong>Виправлення:</strong> оновити неточні дані</li>
          <li><strong>Видалення:</strong> запросити видалення акаунту та всіх даних</li>
          <li><strong>Переносимість:</strong> отримати дані у машинозчитуваному форматі</li>
          <li><strong>Обмеження:</strong> призупинити обробку</li>
          <li><strong>Заперечення:</strong> заперечити проти обробки на підставі законного інтересу</li>
          <li><strong>Відкликання згоди:</strong> відкликати згоду на cookies</li>
        </ul>
        <p>Для реалізації прав: <Email /> — відповімо протягом 30 днів.</p>
      </Section>
      <Section title="8. Зберігання даних">
        <ul>
          <li>Дані акаунту — поки акаунт активний</li>
          <li>Історія чатів — до 2 років з останнього використання</li>
          <li>При видаленні акаунту — всі дані видаляються протягом 30 днів</li>
        </ul>
      </Section>
      <Section title="9. Безпека">
        <ul>
          <li>Шифрування при передачі (HTTPS/TLS)</li>
          <li>Шифрування паролів (bcrypt)</li>
          <li>Ізольована база даних із контролем доступу</li>
        </ul>
      </Section>
      <Section title="10. Діти">
        <p>Сервіс призначений для осіб від 13 років. Ми не збираємо навмисно дані дітей молодше 13 років.</p>
      </Section>
      <Section title="11. Зміни">
        <p>При суттєвих змінах повідомимо email або через Сервіс. Продовження використання означає згоду з новою редакцією.</p>
      </Section>
      <Section title="12. Контакти">
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

function Sub({ children }: { children: React.ReactNode }) {
  return <p className="font-medium text-[var(--foreground)] mt-4 mb-1">{children}</p>;
}

function Email() {
  return (
    <a href="mailto:support@astraly.app" className="text-cosmic-400 hover:underline">
      support@astraly.app
    </a>
  );
}

function ThirdPartyTable({ rows, headers }: { rows: string[][]; headers: string[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm mt-4 border-collapse">
        <thead>
          <tr className="border-b border-[var(--border)]">
            {headers.map((h) => (
              <th key={h} className="text-left py-2 pr-4 text-[var(--muted-foreground)] font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {rows.map(([provider, purpose, country]) => (
            <tr key={provider}>
              <td className="py-2 pr-4">{provider}</td>
              <td className="py-2 pr-4 text-[var(--muted-foreground)]">{purpose}</td>
              <td className="py-2 text-[var(--muted-foreground)]">{country}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
