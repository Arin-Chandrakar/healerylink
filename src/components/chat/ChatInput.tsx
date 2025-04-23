
import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatInputProps } from "@/types/chat";

export const ChatInput = ({ onSend, disabled, loading, apiKey }: ChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2 border-t px-3 py-2 bg-white">
      <Input
        disabled={!apiKey || loading}
        type="text"
        placeholder={apiKey ? "Type your message..." : "Enter API key above"}
        className="flex-1 border-none text-sm px-2 bg-transparent"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button
        variant="ghost"
        size="icon"
        className="text-primary disabled:opacity-50"
        disabled={!apiKey || !input.trim() || loading}
        onClick={handleSend}
      >
        <Send className="w-5 h-5" />
      </Button>
    </div>
  );
};
