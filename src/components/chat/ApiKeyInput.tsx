
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiKeyInputProps } from "@/types/chat";

export const ApiKeyInput = ({
  apiKey,
  apiKeyInput,
  onApiKeyInputChange,
  onSaveApiKey,
  onRemoveApiKey,
}: ApiKeyInputProps) => {
  if (!apiKey) {
    return (
      <div className="p-4 flex flex-col gap-2 bg-gray-50 border-b">
        <p className="text-xs text-gray-700 mb-1">
          Enter your Google Gemini API key to start chatting.
        </p>
        <Input
          type="password"
          placeholder="Paste your Gemini API Key"
          value={apiKeyInput}
          onChange={(e) => onApiKeyInputChange(e.target.value)}
          className="text-xs"
        />
        <Button className="mt-1 text-xs" onClick={onSaveApiKey}>
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
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-1 bg-gray-50 text-gray-600 text-xs border-b">
      <span>Gemini key saved</span>
      <Button
        variant="ghost"
        className="ml-auto h-auto px-2 py-1 hover:underline text-xs"
        onClick={onRemoveApiKey}
      >
        Remove
      </Button>
    </div>
  );
};
