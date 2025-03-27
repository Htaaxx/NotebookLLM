"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Send, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChatBox() {
  const [showSettings, setShowSettings] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<string[]>([]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const [userID, setUserID] = useState("User")

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  useEffect(() => {
    const storedUserID = localStorage.getItem("user_id");
    if (storedUserID) {
      setUserID(storedUserID);
     
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !userID) return;
  
    try {
      await sendMessageToBackend(message, userID);
      setChatHistory((prev) => [...prev, message]);
      setMessage("");
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };  

  const sendMessageToBackend = async (message: string, user_id: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/query?user_id=${encodeURIComponent(user_id)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: message }),
        }
      );
  
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Response from backend:", data);
  
      setChatHistory((prev) => [...prev, message, `Bot: ${data.response}`]);
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-73px)]">
      <div className="flex-1 p-4 overflow-y-auto">
        {chatHistory.map((msg, index) => (
          <div key={index} className="flex justify-end mb-2">
            <div className="bg-green-500 text-black p-2 rounded-full font-sans">
              {msg}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Chat settings
            {showSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {showSettings && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <p className="text-sm">Chat settings panel</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1"
          />
          <Button type="submit">
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
          <Button type="button" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Regen
          </Button>
        </form>
      </div>
    </div>
  );
}
