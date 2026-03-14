import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  const from = process.env.RESEND_FROM_EMAIL ?? "noreply@astraly.app";

  const { data, error } = await getResend().emails.send({
    from: `Astraly <${from}>`,
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
