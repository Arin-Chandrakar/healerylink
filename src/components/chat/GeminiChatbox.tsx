
import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGeminiChat } from "@/hooks/useGeminiChat";
import { ApiKeyInput } from "./ApiKeyInput";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";

export default function GeminiChatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    apiKey,
    apiKeyInput,
    messages,
    loading,
    setApiKeyInput,
    handleSaveApiKey,
    handleRemoveApiKey,
    sendMessage,
  } = useGeminiChat();

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3 rounded-full shadow-lg hover:bg-primary/90 flex items-center"
        aria-label="Open AI chat"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[340px] max-w-xs bg-white rounded-xl shadow-2xl ring-1 ring-black/10 flex flex-col overflow-hidden animate-fade-in outline-none">
      <div className="flex items-center justify-between px-4 py-2 border-b gap-2 bg-primary/90 text-primary-foreground">
        <span className="font-semibold text-base">AI Chat (Gemini)</span>
        <Button
          variant="ghost"
          className="p-1 h-auto hover:bg-primary/80"
          onClick={() => setIsOpen(false)}
          aria-label="Close"
        >
          ✕
        </Button>
      </div>

      <ApiKeyInput
        apiKey={apiKey}
        apiKeyInput={apiKeyInput}
        onApiKeyInputChange={setApiKeyInput}
        onSaveApiKey={handleSaveApiKey}
        onRemoveApiKey={handleRemoveApiKey}
      />

      <div
        className="flex-1 min-h-[180px] bg-white px-2 py-2 overflow-y-auto"
        style={{ maxHeight: 320 }}
      >
        <ChatMessages messages={messages} loading={loading} />
      </div>

      <ChatInput
        onSend={sendMessage}
        disabled={!apiKey}
        loading={loading}
        apiKey={apiKey}
      />
    </div>
  );
}
