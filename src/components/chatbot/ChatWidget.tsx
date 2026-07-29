import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";
import { useLocation } from "react-router-dom";
import api from "../../lib/api";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
}

export function ChatWidget() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", sender: "ai", text: "Hello! I am your AI Speaking Coach. How can I help you today?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: "user", text: inputValue };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const res = await api.post("/api/chatbot/message", { message: userMsg.text });
      const aiText = res.data.data?.text || "I'm sorry, I couldn't process that.";
      const aiMsg: Message = { id: (Date.now() + 1).toString(), sender: "ai", text: aiText };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("[Chatbot Error]", err);
      const errorMsg: Message = { id: (Date.now() + 1).toString(), sender: "ai", text: "Sorry, I am having trouble connecting right now." };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Hide on practice room — AFTER all hooks
  if (location.pathname === "/practice/room") {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-40 right-4 w-[350px] h-[500px] z-50 bg-surface dark:bg-surface-dark border-4 border-neutral rounded-neu-lg shadow-neu-lg flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary px-4 py-3 border-b-4 border-neutral flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot size={20} className="text-neutral" />
                <h3 className="font-bold text-neutral text-lg">AI Coach</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral hover:bg-neutral/10 p-1 rounded-neu transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface dark:bg-surface-dark">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 border-2 border-neutral rounded-neu text-sm ${
                      msg.sender === "user"
                        ? "bg-secondary text-white"
                        : "bg-white text-neutral dark:bg-neutral dark:text-white"
                    }`}
                  >
                    {msg.text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
                      if (part.startsWith("**") && part.endsWith("**")) {
                        return <strong key={index}>{part.slice(2, -2)}</strong>;
                      }
                      return <span key={index}>{part}</span>;
                    })}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-3 border-2 border-neutral rounded-neu bg-white dark:bg-neutral flex items-center gap-1">
                    <div className="w-2 h-2 bg-neutral dark:bg-white animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-neutral dark:bg-white animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-neutral dark:bg-white animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-surface-dark border-t-4 border-neutral">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask for speaking tips..."
                  className="flex-1 border-2 border-neutral rounded-neu px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-neutral dark:text-white dark:placeholder-white/50"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-primary text-neutral border-2 border-neutral rounded-neu px-3 py-2 disabled:opacity-50 hover:bg-primary/80 transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-primary text-neutral border-4 border-neutral rounded-neu flex items-center justify-center shadow-neu z-50 hover:bg-primary/90 transition-colors"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </>
  );
}
