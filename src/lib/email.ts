import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@astraly.app";
const FROM_NAME = "Astraly";

export interface SendEmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  const { data, error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM}>`,
    to,
    subject,
    react,
  });

  if (error) {
    console.error("[email] Failed to send:", error);
    throw new Error(error.message);
  }

  return data;
}
