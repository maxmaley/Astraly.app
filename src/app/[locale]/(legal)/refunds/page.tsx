import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика возврата средств",
  description: "Политика возврата средств сервиса Astraly",
};

export default function RefundsPage() {
  return (
    <article className="text-[var(--foreground)]">
      <h1 className="text-3xl font-bold font-display mb-2">
        Политика возврата средств
      </h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-10">
        Последнее обновление: 1 марта 2026 г.
      </p>

      <Section title="1. Бесплатный пробный период">
        <p>
          Все платные планы Astraly предоставляются с{" "}
          <strong>3-дневным бесплатным пробным периодом</strong>. В течение этого
          времени вы можете оценить функционал без каких-либо обязательств.
          Отменив подписку до окончания пробного периода, вы не будете
          charged.
        </p>
      </Section>

      <Section title="2. Общее правило">
        <p>
          После завершения пробного периода и списания средств{" "}
          <strong>возврат за текущий оплаченный период не предусмотрен</strong>.
          Это стандартная практика для цифровых подписочных сервисов.
        </p>
        <p>
          При отмене подписки доступ к платным функциям сохраняется до конца
          уже оплаченного периода. Повторного списания не происходит.
        </p>
      </Section>

      <Section title="3. Исключения — когда возврат возможен">
        <p>
          Мы рассматриваем возврат средств в следующих случаях:
        </p>
        <ul>
          <li>
            <strong>Техническая неисправность:</strong> Сервис был недоступен
            более 72 часов подряд по нашей вине в течение оплаченного периода
          </li>
          <li>
            <strong>Двойное списание:</strong> с вас были ошибочно списаны
            средства дважды за один и тот же период
          </li>
          <li>
            <strong>Несанкционированное списание:</strong> платёж был произведён
            без вашего ведома (при условии своевременного обращения)
          </li>
          <li>
            <strong>Требования законодательства:</strong> если применимое
            законодательство вашей страны предусматривает обязательное право на
            возврат — мы его соблюдаем
          </li>
        </ul>
      </Section>

      <Section title="4. Как запросить возврат">
        <p>Для запроса возврата напишите на{" "}
          <a
            href="mailto:support@astraly.app"
            className="text-cosmic-400 hover:underline"
          >
            support@astraly.app
          </a>{" "}
          и укажите:
        </p>
        <ul>
          <li>Email вашего аккаунта</li>
          <li>Дату списания</li>
          <li>Сумму и причину запроса</li>
        </ul>
        <p>
          Мы рассмотрим запрос в течение <strong>5 рабочих дней</strong> и
          свяжемся с вами по email. Одобренный возврат поступает на счёт в
          течение 5–10 рабочих дней в зависимости от вашего банка.
        </p>
      </Section>

      <Section title="5. Годовые подписки">
        <p>
          Если вы оформили годовую подписку и хотите отменить её в первые{" "}
          <strong>14 дней</strong> после первого списания (исключая пробный
          период) — напишите нам, и мы рассмотрим возможность пропорционального
          возврата за неиспользованные месяцы.
        </p>
      </Section>

      <Section title="6. Контакты">
        <p>По вопросам возврата средств:</p>
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
