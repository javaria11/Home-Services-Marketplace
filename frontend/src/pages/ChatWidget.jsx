import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import aiApi from '../api/aiApi';
import { useAuth } from '../context/AuthContext';

function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I can help you find a painter, plumber, or electrician. What do you need?", quick_replies: [] },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const sessionId = useRef(`session_${Date.now()}`);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = async (text) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', text: messageText }]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiApi.post('/chat', {
        message: messageText,
        user_id: user ? user.id : null,
        session_id: sessionId.current,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: res.data.reply,
          quick_replies: res.data.quick_replies || [],
          matched_providers: res.data.matched_providers || [],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: "Sorry, I couldn't process that right now. Please try again.", quick_replies: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 flex items-center gap-2.5 pl-3 pr-5 py-3 rounded-full bg-[#00236F] hover:bg-[#001a54] text-white shadow-xl transition-transform hover:scale-105 z-50"
        >
          <span className="w-8 h-8 rounded-full bg-[#16A34A]/90 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </span>
          <span className="font-bold text-sm whitespace-nowrap">HomeEase AI Assistant</span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#A4F1B2] animate-pulse shrink-0" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-90 h-130 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-[#E1E3E4]">
          {/* Header */}
          <div className="bg-[#00236F] text-white px-5 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A4F1B2]" />
              <span className="font-bold text-sm">HomeEase AI Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#F8F9FA]">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm ${
                    m.role === 'user'
                      ? 'bg-[#00236F] text-white rounded-br-sm'
                      : 'bg-white border border-[#E1E3E4] text-[#191C1D] rounded-bl-sm'
                  }`}
                >
                  {m.role === 'bot' ? (
  <ReactMarkdown
    components={{
      p: ({ children }) => (
        <p className="mb-2 last:mb-0">{children}</p>
      ),

      strong: ({ children }) => (
        <strong className="font-bold">{children}</strong>
      ),

      em: ({ children }) => (
        <em className="italic">{children}</em>
      ),

      ul: ({ children }) => (
        <ul className="list-disc pl-5 space-y-1 mb-2">
          {children}
        </ul>
      ),

      ol: ({ children }) => (
        <ol className="list-decimal pl-5 space-y-1 mb-2">
          {children}
        </ol>
      ),

      li: ({ children }) => (
        <li>{children}</li>
      ),

      h1: ({ children }) => (
        <h1 className="text-base font-bold mb-2">
          {children}
        </h1>
      ),

      h2: ({ children }) => (
        <h2 className="text-base font-bold mb-2">
          {children}
        </h2>
      ),

      h3: ({ children }) => (
        <h3 className="font-bold mb-1">
          {children}
        </h3>
      ),

      code: ({ children }) => (
        <code className="bg-[#F3F4F5] px-1.5 py-0.5 rounded text-xs">
          {children}
        </code>
      ),

      blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-[#00236F] pl-3 italic text-[#444651] my-2">
          {children}
        </blockquote>
      ),
    }}
  >
    {m.text}
  </ReactMarkdown>
) : (
  m.text
)}
                </div>

                {m.matched_providers?.length > 0 && (
                  <div className="mt-1.5 flex flex-col gap-1.5 w-full">
                    {m.matched_providers.map((p, idx) => (
                      <div key={idx} className="bg-white border border-[#E1E3E4] rounded-lg px-3 py-2 text-xs">
                        <strong className="text-[#191C1D]">{p.name}</strong>
                        <span className="text-[#444651]"> — {p.category}, ${p.hourly_rate}/hr, ⭐ {p.rating}</span>
                      </div>
                    ))}
                  </div>
                )}

                {m.quick_replies?.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {m.quick_replies.map((qr, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(qr)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#00236F] text-[#00236F] hover:bg-[#00236F] hover:text-white transition-colors"
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="bg-white border border-[#E1E3E4] text-[#757682] px-3.5 py-2.5 rounded-2xl rounded-bl-sm text-sm w-fit">
                Typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t border-[#E1E3E4] bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a service..."
              className="flex-1 px-4 py-2.5 rounded-full border border-[#C5C5D3] text-sm focus:outline-none focus:ring-2 focus:ring-[#00236F]/15"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-10 h-10 rounded-full bg-[#16A34A] hover:bg-[#128A3E] disabled:bg-slate-300 text-white flex items-center justify-center transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default ChatWidget;