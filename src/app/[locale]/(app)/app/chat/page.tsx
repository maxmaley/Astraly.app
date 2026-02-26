import { getTranslations } from "next-intl/server";
import { ChatInterface } from "@/components/chat/ChatInterface";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: { explain?: string; horoscope?: string };
}) {
  const t = await getTranslations("chat");

  let initialPrompt: string | undefined;
  if (searchParams.explain === "1") {
    initialPrompt = t("explainPrompt");
  } else if (searchParams.horoscope === "1") {
    initialPrompt = t("horoscopePrompt");
  }

  return <ChatInterface initialPrompt={initialPrompt} />;
}
