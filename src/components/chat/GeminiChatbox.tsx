
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGeminiChat } from "@/hooks/useGeminiChat";
import { ApiKeyInput } from "./ApiKeyInput";
import { ChatInput } from "./ChatInput";
import { ChatMessages } from "./ChatMessages";

const GeminiChatbox = () => {
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

  const handleSendMessage = (message: string) => {
    if (message.trim()) {
      messages.push({ role: "user", content: message });
      sendMessage(message);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-xl shadow-lg border flex flex-col">
      <div className="flex items-center gap-2 p-4 border-b">
        <MessageSquare className="w-5 h-5 text-primary" />
        <span className="font-medium">AI Assistant</span>
      </div>
      
      <ApiKeyInput
        apiKey={apiKey}
        apiKeyInput={apiKeyInput}
        onApiKeyInputChange={setApiKeyInput}
        onSaveApiKey={handleSaveApiKey}
        onRemoveApiKey={handleRemoveApiKey}
      />

      <div className="flex-1 h-96 overflow-y-auto p-4">
        <ChatMessages messages={messages} loading={loading} />
      </div>

      <ChatInput
        onSend={handleSendMessage}
        disabled={!apiKey}
        loading={loading}
        apiKey={apiKey}
      />
    </div>
  );
};

export default GeminiChatbox;
