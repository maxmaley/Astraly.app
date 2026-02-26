import { getTranslations } from "next-intl/server";
import { ChatInterface } from "@/components/chat/ChatInterface";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: { explain?: string };
}) {
  const isExplain = searchParams.explain === "1";
  const t = isExplain ? await getTranslations("chat") : null;
  const initialPrompt = isExplain && t ? t("explainPrompt") : undefined;

  return <ChatInterface initialPrompt={initialPrompt} />;
}
