'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, X, Loader } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

interface PageBotProps {
  context?: string;
  position?: 'bottom-right' | 'bottom-left';
}

export function PageBot({ context = 'general', position = 'bottom-right' }: PageBotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { t, language } = useTranslation();
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', text: input }]);
    setLoading(true);
    setInput('');

    try {
      const response = await fetch('/api/chat/service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input,
          language: language,
          context: context,
        }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'bot', text: data.response }]);
    } catch (error) {
      console.error('Bot error:', error);
      setMessages((prev) => [...prev, { role: 'bot', text: 'Error: Could not get response' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        [position === 'bottom-right' ? 'right' : 'left']: '20px',
        bottom: '20px',
        zIndex: 999,
        fontFamily: 'inherit',
      }}
    >
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#1E5BA8',
            color: '#FFFFFF',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(30, 91, 168, 0.3)',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px rgba(30, 91, 168, 0.4)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(30, 91, 168, 0.3)';
          }}
        >
          <MessageSquare size={24} />
        </button>
      )}

      {open && (
        <div
          style={{
            width: '320px',
            height: '480px',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E8E8E8',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid #E8E8E8',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#1E5BA8',
              color: '#FFFFFF',
              borderRadius: '12px 12px 0 0',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '14px' }}>Wei Lin Bot</div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: msg.role === 'user' ? '#1E5BA8' : '#F0F0F0',
                    color: msg.role === 'user' ? '#FFFFFF' : '#2C2C2C',
                    fontSize: '12px',
                    lineHeight: 1.4,
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: '4px' }}>
                <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '12px', color: '#999999' }}>Thinking...</span>
              </div>
            )}
            <div ref={messagesEnd} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px', borderTop: '1px solid #E8E8E8', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('chat.placeholder', 'Ask a question...')}
              disabled={loading}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #E8E8E8',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '4px',
                backgroundColor: '#1E5BA8',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: loading || !input.trim() ? 0.5 : 1,
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
