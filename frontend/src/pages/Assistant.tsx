import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, Lightbulb, Loader } from 'lucide-react';
import { api } from '../lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Tip {
  id: string;
  title: string;
  description: string;
  category: string;
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [tips, setTips] = useState<Tip[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTips();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchTips = async () => {
    try {
      const data = await api.get<Tip[]>('/api/ai/tips');
      setTips(data);
    } catch (error) {
      console.error('Failed to fetch tips:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post<{
        conversationId: string;
        response: string;
      }>('/api/ai/chat', {
        message: userMessage.content,
        conversationId,
      });

      setConversationId(response.conversationId);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (question: string) => {
    setInput(question);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-aegis-primary/20 rounded-xl">
          <Bot className="w-8 h-8 text-aegis-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Security Assistant</h1>
          <p className="text-gray-400">Ask me anything about cybersecurity</p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col card">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Bot className="w-16 h-16 text-aegis-primary/50 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  How can I help you today?
                </h3>
                <p className="text-gray-400 max-w-md mb-6">
                  I can explain security concepts, help you understand breaches, and guide you
                  through securing your accounts.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    'What is two-factor authentication?',
                    'How do I create a strong password?',
                    'What should I do after a data breach?',
                  ].map((question) => (
                    <button
                      key={question}
                      onClick={() => handleQuickAction(question)}
                      className="btn-secondary text-sm"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-aegis-primary/20'
                        : 'bg-aegis-card border border-aegis-border'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-aegis-primary" />
                    ) : (
                      <Bot className="w-5 h-5 text-aegis-accent" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] p-4 rounded-xl ${
                      message.role === 'user'
                        ? 'bg-aegis-primary text-white'
                        : 'bg-aegis-dark border border-aegis-border text-gray-300'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-aegis-card border border-aegis-border">
                  <Bot className="w-5 h-5 text-aegis-accent" />
                </div>
                <div className="bg-aegis-dark border border-aegis-border rounded-xl p-4">
                  <Loader className="w-5 h-5 text-aegis-primary animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a security question..."
              className="input flex-1"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="btn-primary px-6"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Tips Sidebar */}
        <div className="hidden lg:block w-80 space-y-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-aegis-warning" />
              <h2 className="font-semibold text-white">Security Tips</h2>
            </div>
            <div className="space-y-3">
              {tips.map((tip) => (
                <div
                  key={tip.id}
                  className="p-3 bg-aegis-dark rounded-lg hover:bg-aegis-border/50 transition-colors cursor-pointer"
                  onClick={() => handleQuickAction(`Tell me more about: ${tip.title}`)}
                >
                  <h3 className="text-sm font-medium text-white mb-1">{tip.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2">{tip.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-white mb-3">Quick Questions</h2>
            <div className="space-y-2">
              {[
                'What is phishing?',
                'How does encryption work?',
                'What is social engineering?',
                'How to spot a scam?',
              ].map((question) => (
                <button
                  key={question}
                  onClick={() => handleQuickAction(question)}
                  className="w-full text-left text-sm p-2 rounded-lg text-gray-400 hover:text-white hover:bg-aegis-dark transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
