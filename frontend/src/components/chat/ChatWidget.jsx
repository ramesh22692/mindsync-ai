import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, AlertTriangle, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Generate unique session ID
const generateSessionId = () => {
  return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const quickActions = [
  { id: "fit", label: "Check if this is right for me", message: "I want to check if your services are right for me." },
  { id: "services", label: "What services do you offer?", message: "What services do you offer?" },
  { id: "pricing", label: "Pricing & policies", message: "Can you tell me about your pricing and policies?" },
  { id: "booking", label: "Book an appointment", message: "I'd like to book an appointment." },
];

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [isCrisis, setIsCrisis] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize session
    let storedSessionId = localStorage.getItem("chatSessionId");
    if (!storedSessionId) {
      storedSessionId = generateSessionId();
      localStorage.setItem("chatSessionId", storedSessionId);
    }
    setSessionId(storedSessionId);

    // Load existing messages
    const loadSession = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/chat/session/${storedSessionId}`);
        if (response.data.messages && response.data.messages.length > 0) {
          setMessages(response.data.messages);
          setShowQuickActions(false);
        }
        if (response.data.crisis_detected) {
          setIsCrisis(true);
        }
      } catch (error) {
        console.log("No existing session");
      }
    };

    if (storedSessionId) {
      loadSession();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading || isCrisis) return;

    const userMessage = {
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setShowQuickActions(false);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/chat`, {
        session_id: sessionId,
        message: messageText,
      });

      const assistantMessage = {
        role: "assistant",
        content: response.data.response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (response.data.is_crisis_detected) {
        setIsCrisis(true);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        role: "assistant",
        content: "I apologize, but I'm having trouble connecting right now. Please try again or contact us directly.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    sendMessage(action.message);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const resetChat = () => {
    const newSessionId = generateSessionId();
    localStorage.setItem("chatSessionId", newSessionId);
    setSessionId(newSessionId);
    setMessages([]);
    setIsCrisis(false);
    setShowQuickActions(true);
  };

  const goToCrisis = () => {
    setIsOpen(false);
    navigate("/crisis");
  };

  return (
    <div className="chat-widget" data-testid="chat-widget">
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chat-bubble group"
          data-testid="chat-open-btn"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window" data-testid="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <h3 className="font-semibold text-sm">AI Receptionist</h3>
                <p className="text-xs opacity-80">Non-diagnostic assistance</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-full p-1 transition-colors"
              data-testid="chat-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Warning Banner */}
          <div className="bg-amber-50 border-b border-amber-200 px-3 py-2 text-xs text-amber-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>AI cannot diagnose or handle emergencies. Avoid sharing sensitive details.</span>
          </div>

          {/* Crisis State */}
          {isCrisis && (
            <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-3">
              <p className="text-sm text-destructive font-medium mb-2">
                It seems you may be going through a difficult time.
              </p>
              <Button
                onClick={goToCrisis}
                className="btn-crisis w-full text-sm"
                data-testid="crisis-redirect-btn"
              >
                Get Immediate Help
              </Button>
            </div>
          )}

          {/* Messages Area */}
          <ScrollArea className="chat-messages">
            {messages.length === 0 && showQuickActions && (
              <div className="space-y-4">
                <div className="message-assistant">
                  <p className="text-sm">
                    Hello! I'm the AI receptionist for Mutha's Psychology Intelligence. 
                    I can help you with scheduling, service information, and general questions.
                  </p>
                  <p className="text-sm mt-2">
                    How can I assist you today?
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action)}
                      className="w-full text-left px-4 py-2 rounded-lg border border-primary/20 bg-white hover:bg-secondary/50 text-sm text-foreground transition-colors"
                      data-testid={`quick-action-${action.id}`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={message.role === "user" ? "message-user" : "message-assistant"}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}

            {isLoading && (
              <div className="message-assistant flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Input Area */}
          <div className="chat-input-area">
            {isCrisis ? (
              <div className="text-center">
                <Button
                  onClick={resetChat}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  data-testid="reset-chat-btn"
                >
                  Start New Conversation
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 h-10 text-sm"
                  disabled={isLoading}
                  data-testid="chat-input"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-10 w-10 bg-primary hover:bg-primary/90"
                  disabled={!inputValue.trim() || isLoading}
                  data-testid="chat-send-btn"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
