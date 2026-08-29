import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User as UserIcon, X, Loader2, ArrowDownLeft } from 'lucide-react';

export default function GeminiChatDrawer({ isOpen, onClose, user, onInsertToJournal, backendUrl }) {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: "Hello! I'm your Gemini journaling partner. What's on your mind today? We can brainstorm ideas, unpack a complex decision, or reflect on how you're feeling."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "Help me reflect on what went well today",
    "I feel overwhelmed with tasks, help me prioritize",
    "Help me reframe an anxious thought",
    "Brainstorm creative solutions to a problem"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const queryText = textToSend || input;
    if (!queryText.trim() || loading) return;

    if (!user) {
      alert("Please sign in to chat with Gemini.");
      return;
    }

    const newMessages = [...messages, { role: 'user', content: queryText }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const token = await user.getIdToken();
      const res = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: newMessages })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      setMessages([...newMessages, { role: 'model', content: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        { role: 'model', content: "Sorry, I had trouble connecting to the backend. Please check that the server is running." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      width: '420px',
      borderLeft: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-secondary)',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 64px)',
      position: 'relative',
      zIndex: 20
    }}>
      {/* Drawer Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(15, 23, 42, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--accent)" />
          <span style={{ fontWeight: '700', fontSize: '15px', color: '#fff' }}>Gemini Co-Pilot</span>
          <span style={{
            fontSize: '11px',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            color: '#a5b4fc',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            Multi-Turn
          </span>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
          <X size={18} />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {messages.map((msg, index) => {
          const isModel = msg.role === 'model';
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                flexDirection: isModel ? 'row' : 'row-reverse'
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: isModel ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {isModel ? <Bot size={16} color="#fff" /> : <UserIcon size={16} color="#fff" />}
              </div>

              <div style={{ maxWidth: '80%' }}>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: isModel ? '0 12px 12px 12px' : '12px 0 12px 12px',
                  backgroundColor: isModel ? 'var(--bg-card)' : 'var(--accent)',
                  color: '#fff',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  border: isModel ? '1px solid var(--border-color)' : 'none',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.content}
                </div>

                {isModel && index > 0 && (
                  <button
                    onClick={() => onInsertToJournal(msg.content)}
                    style={{
                      marginTop: '4px',
                      fontSize: '11px',
                      background: 'transparent',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <ArrowDownLeft size={12} /> Add takeaway to notes
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={16} color="#fff" />
            </div>
            <div style={{
              padding: '8px 14px',
              borderRadius: '0 12px 12px 12px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Loader2 size={14} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
              Gemini is thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div style={{
        padding: '8px 16px',
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSend(qp)}
            style={{
              padding: '4px 10px',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontSize: '11px',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div style={{
        padding: '14px 16px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Gemini or share a thought..."
            disabled={loading}
            style={{
              flex: 1,
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#fff',
              fontSize: '13px'
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: loading || !input.trim() ? 0.5 : 1
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
