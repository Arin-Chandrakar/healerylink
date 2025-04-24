import React, { useRef, useState, useEffect } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";

interface Message {
  role: "user" | "ai";
  content: string;
}

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

export default function GeminiChatbox() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("GEMINI_API_KEY") || "");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem("GEMINI_API_KEY", apiKeyInput.trim());
      setApiKey(apiKeyInput.trim());
      toast.success("API key saved successfully");
    }
  };

  const handleRemoveApiKey = () => {
    localStorage.removeItem("GEMINI_API_KEY");
    setApiKey("");
    setApiKeyInput("");
    toast.success("API key removed");
  };

  const sendWithGemini = async (userPrompt: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: userPrompt }]
            }
          ],
          generation_config: {
            temperature: 0.7,
            top_p: 0.95,
            top_k: 40,
            max_output_tokens: 1024,
          }
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to get response from Gemini");
      }

      const data = await response.json();
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand that.";
      setMessages((prev) => [...prev, { role: "ai", content: aiText }]);
    } catch (error) {
      console.error("Gemini API error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to contact Gemini API");
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "There was an error contacting Gemini API." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    if (!apiKey) {
      toast.error("Please enter your API key first");
      return;
    }

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    await sendWithGemini(userMsg);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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

      {!apiKey ? (
        <div className="p-4 flex flex-col gap-2 bg-gray-50 border-b">
          <p className="text-xs text-gray-700 mb-1">
            Enter your Google Gemini API key to start chatting.
          </p>
          <Input
            type="password"
            placeholder="Paste your Gemini API Key"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            className="text-xs"
          />
          <Button
            className="mt-1 text-xs"
            onClick={handleSaveApiKey}
          >
            Save API Key
          </Button>
          <a 
            className="text-xs text-blue-700 underline mt-2" 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Get your API key here
          </a>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 py-1 bg-gray-50 text-gray-600 text-xs border-b">
          <span>Gemini key saved</span>
          <Button
            variant="ghost"
            className="ml-auto h-auto px-2 py-1 hover:underline text-xs"
            onClick={handleRemoveApiKey}
          >
            Remove
          </Button>
        </div>
      )}

      <div className="flex-1 min-h-[180px] bg-white px-2 py-2 overflow-y-auto" style={{ maxHeight: 320 }}>
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">
            Ask me anything about health, doctors, or appointments!
          </div>
        ) : (
          <div className="space-y-2 pr-1">
            {messages.map((m, i) => (
              <div key={i} className={`flex justify-${m.role === "user" ? "end" : "start"}`}>
                <div className={`${
                  m.role === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-gray-100 text-gray-800"
                } px-3 py-2 rounded-2xl text-sm max-w-[70%]`}>
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
        {loading && (
          <div className="flex justify-center text-xs text-gray-500 pt-2">
            Thinking...
          </div>
        )}
      </div>

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
    </div>
  );
}
