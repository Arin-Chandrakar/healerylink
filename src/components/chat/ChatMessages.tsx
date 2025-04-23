
import { useRef, useEffect } from "react";
import { ChatMessagesProps } from "@/types/chat";

export const ChatMessages = ({ messages, loading }: ChatMessagesProps) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400 text-sm">
        Ask me anything about health, doctors, or appointments!
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex justify-${m.role === "user" ? "end" : "start"}`}>
            <div
              className={`${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-100 text-gray-800"
              } px-3 py-2 rounded-2xl text-sm max-w-[70%]`}
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      {loading && (
        <div className="flex justify-center text-xs text-gray-500 pt-2">
          Thinking...
        </div>
      )}
    </>
  );
};
