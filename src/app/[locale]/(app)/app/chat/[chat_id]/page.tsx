import { ChatInterface } from "@/components/chat/ChatInterface";

export default function ChatDetailPage({
  params,
}: {
  params: { chat_id: string };
}) {
  return <ChatInterface chatId={params.chat_id} />;
}
