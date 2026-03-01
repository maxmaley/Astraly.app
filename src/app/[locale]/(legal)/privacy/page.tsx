import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description: "Политика конфиденциальности сервиса Astraly",
};

export default function PrivacyPage() {
  return (
    <article className="text-[var(--foreground)]">
      <h1 className="text-3xl font-bold font-display mb-2">
        Политика конфиденциальности
      </h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-10">
        Последнее обновление: 1 марта 2026 г.
      </p>

      <Section title="1. Общие положения">
        <p>
          Astraly (далее — «Сервис», «мы») — астрологический веб-сервис по
          адресу astraly.app, управляемый физическим лицом{" "}
          <strong>Maksym Olliinyk</strong>, г. Батуми, Грузия.
        </p>
        <p>
          Мы серьёзно относимся к вашей конфиденциальности. Настоящая Политика
          объясняет, какие данные мы собираем, как используем их и какие права у
          вас есть в отношении ваших данных.
        </p>
        <p>
          По всем вопросам конфиденциальности:{" "}
          <a
            href="mailto:support@astraly.app"
            className="text-cosmic-400 hover:underline"
          >
            support@astraly.app
          </a>
        </p>
      </Section>

      <Section title="2. Какие данные мы собираем">
        <Subtitle>Данные для регистрации и входа</Subtitle>
        <ul>
          <li>Адрес электронной почты</li>
          <li>
            Пароль (хранится в зашифрованном виде; мы не имеем к нему доступа)
          </li>
          <li>
            Данные Google-аккаунта при входе через OAuth: имя, email, фото
            профиля
          </li>
        </ul>

        <Subtitle>Астрологические данные</Subtitle>
        <ul>
          <li>Имя (отображаемое в интерфейсе)</li>
          <li>Дата рождения</li>
          <li>Время рождения (необязательно)</li>
          <li>Город рождения</li>
          <li>
            Географические координаты (вычисляются автоматически по городу для
            расчёта карты)
          </li>
        </ul>
        <p>
          Эти данные являются основой для расчёта натальной карты — без них
          Сервис не может предоставить свою главную функцию.
        </p>

        <Subtitle>Данные об использовании</Subtitle>
        <ul>
          <li>История чатов с AI-астрологом</li>
          <li>Выбранный план подписки и статус оплаты</li>
          <li>Настройки аккаунта (язык, тема, уведомления)</li>
        </ul>

        <Subtitle>Технические данные</Subtitle>
        <ul>
          <li>Файлы сессии (cookies) для аутентификации</li>
          <li>
            IP-адрес (сохраняется поставщиком облачной инфраструктуры
            автоматически)
          </li>
          <li>Информация о браузере и устройстве (стандартные HTTP-заголовки)</li>
        </ul>
      </Section>

      <Section title="3. Как мы используем ваши данные">
        <ul>
          <li>
            <strong>Предоставление Сервиса:</strong> расчёт натальной карты,
            персональные гороскопы, ответы AI-астролога
          </li>
          <li>
            <strong>Управление аккаунтом:</strong> аутентификация, сохранение
            настроек и предпочтений
          </li>
          <li>
            <strong>Обработка платежей:</strong> передача необходимых данных
            платёжному провайдеру (данные карты мы не храним)
          </li>
          <li>
            <strong>Улучшение Сервиса:</strong> анализ агрегированной статистики
            использования (в будущем — через Google Analytics)
          </li>
          <li>
            <strong>Уведомления:</strong> email и Telegram, только при
            включении соответствующих настроек
          </li>
        </ul>
      </Section>

      <Section title="4. Правовые основания (GDPR)">
        <p>Для пользователей из ЕС и ЕЭП обработка данных основана на:</p>
        <ul>
          <li>
            <strong>Договоре:</strong> обработка данных, необходимых для
            предоставления Сервиса (астрологические данные, аккаунт)
          </li>
          <li>
            <strong>Законном интересе:</strong> безопасность Сервиса, защита от
            мошенничества
          </li>
          <li>
            <strong>Согласии:</strong> аналитические и рекламные cookies —
            согласие можно отозвать в любой момент
          </li>
        </ul>
      </Section>

      <Section title="5. Третьи лица">
        <p>
          Для работы Сервиса мы используем следующих поставщиков. Каждый из них
          соблюдает требования GDPR и имеет соответствующее соглашение о защите
          данных.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm mt-4 border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 pr-4 text-[var(--muted-foreground)] font-medium">
                  Поставщик
                </th>
                <th className="text-left py-2 pr-4 text-[var(--muted-foreground)] font-medium">
                  Назначение
                </th>
                <th className="text-left py-2 text-[var(--muted-foreground)] font-medium">
                  Страна
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {[
                ["Supabase", "База данных, аутентификация", "США"],
                ["Anthropic (Claude AI)", "Ответы AI-астролога в чате", "США"],
                ["Google (OAuth)", "Авторизация через Google", "США"],
                [
                  "Google Analytics",
                  "Аналитика посещаемости (не активна)",
                  "США",
                ],
                [
                  "Google Ads",
                  "Рекламные кампании (не активна)",
                  "США",
                ],
                [
                  "Платёжный провайдер",
                  "Обработка платежей (будет подключён)",
                  "—",
                ],
                ["Resend", "Отправка email-уведомлений", "США"],
              ].map(([provider, purpose, country]) => (
                <tr key={provider}>
                  <td className="py-2 pr-4">{provider}</td>
                  <td className="py-2 pr-4 text-[var(--muted-foreground)]">
                    {purpose}
                  </td>
                  <td className="py-2 text-[var(--muted-foreground)]">
                    {country}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="6. Cookies">
        <p>
          Подробнее о cookies — в нашей{" "}
          <a href="../cookies" className="text-cosmic-400 hover:underline">
            Политике cookies
          </a>
          . Кратко:
        </p>
        <ul>
          <li>
            <strong>Необходимые:</strong> файлы сессии для аутентификации,
            языковые предпочтения — без них Сервис не работает
          </li>
          <li>
            <strong>Аналитические (не активны):</strong> Google Analytics —
            помогают понять, как пользователи используют Сервис
          </li>
          <li>
            <strong>Рекламные (не активны):</strong> Google Ads — для оценки
            эффективности рекламных кампаний
          </li>
        </ul>
        <p>
          Аналитические и рекламные cookies активируются только с вашего явного
          согласия.
        </p>
      </Section>

      <Section title="7. Ваши права">
        <p>Вы имеете право:</p>
        <ul>
          <li>
            <strong>Доступа:</strong> запросить копию ваших персональных данных
          </li>
          <li>
            <strong>Исправления:</strong> обновить неточные данные через
            настройки аккаунта
          </li>
          <li>
            <strong>Удаления:</strong> запросить удаление аккаунта и всех
            связанных данных
          </li>
          <li>
            <strong>Переносимости:</strong> получить ваши данные в
            машиночитаемом формате
          </li>
          <li>
            <strong>Ограничения обработки:</strong> запросить приостановку
            обработки данных
          </li>
          <li>
            <strong>Возражения:</strong> возразить против обработки на основе
            законного интереса
          </li>
          <li>
            <strong>Отзыва согласия:</strong> отозвать согласие на
            аналитические или рекламные cookies в любой момент
          </li>
        </ul>
        <p>
          Для реализации прав напишите на{" "}
          <a
            href="mailto:support@astraly.app"
            className="text-cosmic-400 hover:underline"
          >
            support@astraly.app
          </a>
          . Мы ответим в течение 30 дней.
        </p>
      </Section>

      <Section title="8. Хранение данных">
        <ul>
          <li>Данные аккаунта хранятся, пока аккаунт активен</li>
          <li>
            История чатов: до 2 лет с момента последнего использования аккаунта
          </li>
          <li>
            При удалении аккаунта все персональные данные удаляются в течение
            30 дней
          </li>
        </ul>
      </Section>

      <Section title="9. Безопасность">
        <p>Мы принимаем следующие меры защиты:</p>
        <ul>
          <li>Шифрование данных при передаче (HTTPS/TLS)</li>
          <li>Шифрование паролей (bcrypt через Supabase Auth)</li>
          <li>Изолированная база данных с контролем доступа</li>
          <li>Ограниченный доступ к данным пользователей внутри команды</li>
        </ul>
        <p>
          Несмотря на принимаемые меры, ни одна система не может гарантировать
          абсолютную безопасность. В случае утечки данных мы уведомим
          пострадавших пользователей в установленные законом сроки.
        </p>
      </Section>

      <Section title="10. Дети">
        <p>
          Сервис предназначен для лиц от 13 лет. Мы не собираем намеренно
          данные детей младше 13 лет. Если вам стало известно о таком случае —
          сообщите нам, и мы немедленно удалим соответствующие данные.
        </p>
      </Section>

      <Section title="11. Изменения в политике">
        <p>
          Мы можем обновлять настоящую Политику. При существенных изменениях мы
          уведомим вас по email или через уведомление в Сервисе. Дата последнего
          обновления указана в заголовке документа. Продолжение использования
          Сервиса после уведомления означает согласие с новой редакцией.
        </p>
      </Section>

      <Section title="12. Контакты">
        <p>
          По всем вопросам, связанным с конфиденциальностью и обработкой
          персональных данных:
        </p>
        <p>
          <strong>Email:</strong>{" "}
          <a
            href="mailto:support@astraly.app"
            className="text-cosmic-400 hover:underline"
          >
            support@astraly.app
          </a>
        </p>
        <p>
          <strong>Оператор:</strong> Maksym Olliinyk, г. Батуми, Грузия
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

function Subtitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-medium text-[var(--foreground)] mt-4 mb-1">{children}</p>
  );
}
