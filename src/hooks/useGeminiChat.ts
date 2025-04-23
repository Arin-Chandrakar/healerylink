
import { useState, useEffect } from 'react';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";

export const useGeminiChat = () => {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("GEMINI_API_KEY") || "");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

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

  const sendMessage = async (userPrompt: string) => {
    if (!apiKey) {
      toast.error("Please enter your API key first");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: userPrompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to get response from Gemini");
      }

      const data = await response.json();
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand that.";
      setMessages(prev => [...prev, { role: "ai", content: aiText }]);
      toast.success("Response received");
    } catch (error) {
      console.error("Gemini API error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to contact Gemini API");
      setMessages(prev => [
        ...prev,
        { role: "ai", content: "There was an error contacting Gemini API." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return {
    apiKey,
    apiKeyInput,
    messages,
    loading,
    setApiKeyInput,
    handleSaveApiKey,
    handleRemoveApiKey,
    sendMessage,
  };
};
