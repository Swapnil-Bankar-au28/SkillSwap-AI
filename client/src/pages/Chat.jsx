// src/pages/Chat.jsx
// AI Matchmaker Chat — the main conversational interface

import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Send, Bot, CheckCircle, X, Sparkles } from 'lucide-react';

export default function Chat() {
  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState('');
  const [sending, setSending]         = useState(false);
  const [pendingSkills, setPendingSkills] = useState(null); // extracted but not yet confirmed
  const [confirming, setConfirming]   = useState(false);
  const messagesEndRef = useRef(null);

  // Welcome message on mount
  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const loadHistory = async () => {
    try {
      const { data } = await api.get('/chat/history');
      if (data.length > 0) {
        setMessages(data.map((m) => ({ role: m.role, content: m.content })));
      } else {
        // First visit — show welcome
        setMessages([{
          role: 'assistant',
          content: "Hi! I'm your SkillSwap AI matchmaker 🤖\n\nTell me: what skills can you teach, and what do you want to learn? For example: \"I can teach guitar and I want to learn web design.\" I'll find you the perfect swap partner!",
        }]);
      }
    } catch {
      setMessages([{
        role: 'assistant',
        content: "Hi! I'm your SkillSwap AI matchmaker 🤖 What skills can you teach, and what do you want to learn?",
      }]);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setSending(true);

    try {
      const { data } = await api.post('/chat/message', { content: userMessage });

      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);

      // If AI extracted skills, show confirmation banner
      if (data.hasExtraction && data.extractedSkills) {
        const { offered, wanted } = data.extractedSkills;
        if (offered.length > 0 || wanted.length > 0) {
          setPendingSkills(data.extractedSkills);
        }
      }
    } catch (err) {
      toast.error('Message failed — is the server running?');
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: "Sorry, I had trouble connecting. Please make sure the server is running and try again!",
      }]);
    } finally {
      setSending(false);
    }
  };

  const confirmSkills = async () => {
    if (!pendingSkills) return;
    setConfirming(true);
    try {
      await api.post('/chat/confirm-skills', pendingSkills);
      toast.success('Skills saved to your profile! ✅');
      setPendingSkills(null);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: "Great! I've saved those skills to your profile. Now let me search for matches...",
      }]);
    } catch {
      toast.error('Failed to save skills');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column' }}>
      {/* ── Header ───────────────────────────────────── */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: 40, height: 40, background: 'var(--gradient-primary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bot size={20} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: '1rem', fontWeight: 700 }}>SkillSwap AI Matchmaker</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Powered by Claude · Online</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#10b981' }}>
            <div style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%', animation: 'pulse-glow 2s infinite' }} />
            AI Active
          </span>
        </div>
      </div>

      {/* ── Messages ─────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((msg, i) => (
          <div key={i} className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
                <div style={{ width: 24, height: 24, background: 'var(--gradient-primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={12} color="white" />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 600 }}>SkillSwap AI</span>
              </div>
            )}
            <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}
              style={{ whiteSpace: 'pre-wrap' }}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {sending && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
            <div style={{ width: 24, height: 24, background: 'var(--gradient-primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={12} color="white" />
            </div>
            <div className="chat-bubble chat-bubble-ai" style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', padding: '0.75rem 1rem' }}>
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Skill Extraction Confirmation ────────────── */}
      {pendingSkills && (
        <div className="extraction-banner" style={{ margin: '0 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
              <CheckCircle size={18} color="var(--color-primary2)" />
              AI detected these skills — save to your profile?
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setPendingSkills(null)} style={{ padding: '0.125rem' }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
            {pendingSkills.offered?.map((s, i) => (
              <span key={i} className="skill-tag">📤 {s.skillName} ({s.proficiency})</span>
            ))}
            {pendingSkills.wanted?.map((s, i) => (
              <span key={i} className="skill-tag skill-tag-wanted">📥 {s.skillName} ({s.urgency})</span>
            ))}
          </div>
          <button className="btn btn-primary btn-sm" onClick={confirmSkills} disabled={confirming} id="confirm-skills-btn">
            {confirming ? 'Saving...' : '✅ Save these skills'}
          </button>
        </div>
      )}

      {/* ── Input Bar ────────────────────────────────── */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
        {/* Suggestion chips */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {["I can teach guitar and want to learn web design", "Find me a match", "What skills are in demand?"].map((s) => (
            <button key={s} className="btn btn-secondary btn-sm" onClick={() => setInput(s)} style={{ fontSize: '0.75rem' }}>
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            className="input"
            placeholder="Tell me what you can teach and what you want to learn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            id="chat-input"
            style={{ flex: 1 }}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(e)}
          />
          <button type="submit" className="btn btn-primary" disabled={sending || !input.trim()} id="chat-send-btn"
            style={{ flexShrink: 0, padding: '0.75rem 1.125rem' }}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
