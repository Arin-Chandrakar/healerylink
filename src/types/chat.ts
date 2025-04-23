
export interface Message {
  role: "user" | "ai";
  content: string;
}

export interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  loading: boolean;
  apiKey: string;
}

export interface ChatMessagesProps {
  messages: Message[];
  loading: boolean;
}

export interface ApiKeyInputProps {
  apiKey: string;
  apiKeyInput: string;
  onApiKeyInputChange: (value: string) => void;
  onSaveApiKey: () => void;
  onRemoveApiKey: () => void;
}
