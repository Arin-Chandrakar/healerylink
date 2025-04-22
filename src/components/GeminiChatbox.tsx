
import React, { useRef, useState, useEffect } from "react";
import { MessageSquare, Send } from "lucide-react";

interface Message {
  role: "user" | "ai";
  content: string;
}

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

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

  // Save the API key to localStorage
  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem("GEMINI_API_KEY", apiKeyInput.trim());
      setApiKey(apiKeyInput.trim());
    }
  };

  // Remove the API key (in case user wants to reset)
  const handleRemoveApiKey = () => {
    localStorage.removeItem("GEMINI_API_KEY");
    setApiKey("");
    setApiKeyInput("");
  };

  // Gemini chat API call
  const sendWithGemini = async (userPrompt: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userPrompt }] }]
        }),
      });
      const data = await response.json();
      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        data?.candidates?.[0]?.content?.text ||
        "Sorry, I couldn't understand that.";
      setMessages((prev) => [...prev, { role: "ai", content: aiText }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "There was an error contacting Gemini API." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle user message send
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    await sendWithGemini(userMsg);
  };

  // Keyboard Enter to send
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSend();
    }
  };

  // Floating chat button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 flex items-center"
        aria-label="Open AI chat"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[340px] max-w-xs bg-white rounded-xl shadow-2xl ring-1 ring-black/10 flex flex-col overflow-hidden animate-fade-in outline-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b gap-2 bg-primary/90 text-primary-foreground">
        <span className="font-semibold text-base">AI Chat (Gemini)</span>
        <button
          className="p-1 rounded hover:bg-primary/80"
          onClick={() => setIsOpen(false)}
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      {/* API Key Section */}
      {!apiKey ? (
        <div className="p-4 flex flex-col gap-2 bg-gray-50 border-b">
          <p className="text-xs text-gray-700 mb-1">
            Enter your Google Gemini API key to start chatting.
          </p>
          <input
            className="border rounded px-2 py-1 text-xs"
            type="password"
            placeholder="Paste your Gemini API Key"
            value={apiKeyInput}
            onChange={e => setApiKeyInput(e.target.value)}
          />
          <button
            className="mt-1 px-2 py-1 rounded text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSaveApiKey}
          >
            Save API Key
          </button>
          <a className="text-xs text-blue-700 underline mt-2" href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
            Get your API key here
          </a>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 py-1 bg-gray-50 text-gray-600 text-xs border-b">
          <span>Gemini key saved</span>
          <button
            className="ml-auto px-2 py-1 hover:underline rounded"
            onClick={handleRemoveApiKey}
          >
            Remove
          </button>
        </div>
      )}
      {/* Messages */}
      <div className="flex-1 min-h-[180px] bg-white px-2 py-2 overflow-y-auto" style={{ maxHeight: 320 }}>
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">
            Ask me anything about health, doctors, or appointments!
          </div>
        ) : (
          <div className="space-y-2 pr-1">
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="bg-primary text-primary-foreground px-3 py-2 rounded-2xl text-sm max-w-[70%]">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-2xl text-sm max-w-[70%]">
                    {m.content}
                  </div>
                </div>
              )
            )}
            <div ref={bottomRef} />
          </div>
        )}
        {loading && (
          <div className="flex justify-center text-xs text-gray-500 pt-2">
            Thinking...
          </div>
        )}
      </div>
      {/* Input */}
      <div className="flex items-center gap-2 border-t px-3 py-2 bg-white">
        <input
          disabled={!apiKey || loading}
          type="text"
          placeholder={apiKey ? "Type your message..." : "Enter API key above"}
          className="flex-1 border-none outline-none text-sm px-2 bg-transparent"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="p-2 rounded-md hover:bg-primary/10 text-primary disabled:opacity-50"
          disabled={!apiKey || !input.trim() || loading}
          onClick={handleSend}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
