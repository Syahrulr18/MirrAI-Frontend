import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Wand2, Send, Save, ArrowRight, Bot, X } from "lucide-react";
import { Button, Card } from "../components/ui";
import { useSessionStore } from "../store/sessionStore";
import api from "../lib/api";

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
}

export default function ScriptWriterPage() {
  const { t } = useTranslation("writer");
  const navigate = useNavigate();
  const location = useLocation();
  const setScript = useSessionStore((s) => s.setScript);

  const [scriptTitle, setScriptTitle] = useState(location.state?.title || "");
  const [scriptContent, setScriptContent] = useState(location.state?.content || "");
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", sender: "ai", text: t("aiGreeting", "Hello! I am your AI Script Consultant. I can help you brainstorm ideas, generate openings, or review your speech script. How can I assist you today?") }
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

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputValue;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: "user", text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputValue("");
    setIsTyping(true);

    try {
      const res = await api.post("/api/chatbot/message", { message: `Context: User is writing a script titled "${scriptTitle}". Script content so far: "${scriptContent.substring(0, 500)}...". Request: ${textToSend}` });
      const aiText = res.data.data?.text || t("aiError", "I'm sorry, I couldn't process that.");
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: "ai", text: aiText };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("[Chatbot Error]", err);
      const errorMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: "ai", text: t("aiConnectionError", "Sorry, I am having trouble connecting right now.") };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAskAI = (prompt: string) => {
    handleSendMessage(undefined, prompt);
  };

  const handleUseForPractice = () => {
    if (!scriptContent.trim()) {
      alert(t("alertNoContent", "Please write some script content first."));
      return;
    }
    setScript(scriptTitle || "My Custom Script", scriptContent);
    navigate("/practice/setup");
  };

  return (
    <motion.div {...pageTransition} className="max-w-7xl mx-auto px-app-gap py-8 h-[calc(100vh-80px)] flex flex-col">
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral dark:text-white">{t("title", "AI Script Writer")}</h1>
          <p className="text-neutral/60 dark:text-white/50">{t("subtitle", "Draft, review, and perfect your speech with AI")}</p>
        </div>
        <Button variant="primary" onClick={handleUseForPractice} leftIcon={<ArrowRight size={18} />}>
          {t("useForPractice", "Use for Practice")}
        </Button>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* Left: Editor */}
        <div className="flex-1 flex flex-col gap-4">
          <input
            type="text"
            value={scriptTitle}
            onChange={(e) => setScriptTitle(e.target.value)}
            placeholder={t("scriptTitlePlaceholder", "Script Title (e.g., Graduation Speech)")}
            className="w-full text-xl font-bold border-3 border-neutral dark:border-white rounded-neu px-4 py-3 bg-surface dark:bg-surface-dark text-neutral dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-neu-sm dark:shadow-[2px_2px_0_rgba(255,255,255,1)]"
          />
          
          <div className="flex-1 flex flex-col border-3 border-neutral dark:border-white rounded-neu bg-white dark:bg-[#1E1E1E] shadow-neu-sm dark:shadow-[2px_2px_0_rgba(255,255,255,1)] overflow-hidden">
            <textarea
              value={scriptContent}
              onChange={(e) => setScriptContent(e.target.value)}
              placeholder={t("scriptContentPlaceholder", "Write your speech here, or ask AI for a draft...")}
              className="flex-1 w-full p-4 bg-transparent text-neutral dark:text-white focus:outline-none resize-none"
            />
            
            {/* Editor Toolbar (Bottom) */}
            <div className="p-3 border-t-2 border-neutral/10 dark:border-white/10 bg-neutral/5 dark:bg-white/5 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => handleAskAI("Review my script and suggest improvements")} leftIcon={<Wand2 size={14} />}>
                {t("reviewScript", "Review Script")}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleAskAI("Generate a catchy opening for this speech")}>
                {t("catchyOpening", "Catchy Opening")}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleAskAI("Generate a strong closing statement")}>
                {t("strongClosing", "Strong Closing")}
              </Button>
            </div>
          </div>
          
          <div className="text-right text-xs font-bold text-neutral/50 dark:text-white/40 uppercase">
            {scriptContent.trim() ? scriptContent.trim().split(/\s+/).length : 0} {t("words", "Words")}
          </div>
        </div>

        {/* Right: AI Consultant Chat */}
        <Card className="w-full lg:w-[400px] flex flex-col border-3 border-neutral dark:border-white shadow-neu dark:shadow-[4px_4px_0_rgba(255,255,255,1)] bg-surface dark:bg-surface-dark overflow-hidden">
          <div className="bg-primary px-4 py-3 border-b-3 border-neutral dark:border-white flex items-center gap-2">
            <Bot size={20} className="text-neutral" />
            <h3 className="font-bold text-neutral text-lg">{t("aiConsultant", "AI Consultant")}</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-surface-dark">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] p-3 border-2 border-neutral dark:border-white rounded-neu text-sm ${
                    msg.sender === "user" ? "bg-secondary text-white" : "bg-neutral/5 dark:bg-white/10 text-neutral dark:text-white"
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
                <div className="max-w-[85%] p-3 border-2 border-neutral rounded-neu bg-neutral/5 dark:bg-white/10 flex items-center gap-1">
                  <div className="w-2 h-2 bg-neutral dark:bg-white animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-neutral dark:bg-white animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-neutral dark:bg-white animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t-3 border-neutral bg-surface dark:bg-surface-dark">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask AI..."
                className="flex-1 border-2 border-neutral rounded-neu px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-neutral dark:text-white"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="bg-primary text-neutral border-2 border-neutral rounded-neu px-3 py-2 disabled:opacity-50 hover:bg-primary/80 transition-colors flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </Card>

      </div>
    </motion.div>
  );
}
