// src/pages/MatchDetail.jsx
// Detailed match view with negotiation chat, agreement display, rating, and report

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Send, Star, Flag, CheckCircle, Users, ArrowRight, Sparkles } from 'lucide-react';

const statusClass = {
  proposed:    'badge-proposed',
  negotiating: 'badge-negotiating',
  agreed:      'badge-agreed',
  completed:   'badge-completed',
  cancelled:   'badge-cancelled',
};

export default function MatchDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [match, setMatch]         = useState(null);
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [sending, setSending]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const [showRating, setShowRating] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingUser, setRatingUser] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => { fetchAll(); }, [id]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, sending]);

  const fetchAll = async () => {
    try {
      const [matchRes, chatRes] = await Promise.all([
        api.get(`/matches/${id}`),
        api.get(`/chat/history?matchId=${id}`),
      ]);
      setMatch(matchRes.data);
      setMessages(chatRes.data.map((m) => ({ role: m.role, content: m.content })));
    } catch { toast.error('Failed to load match'); }
    finally { setLoading(false); }
  };

  const sendNegotiationMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setSending(true);
    try {
      const { data } = await api.post('/chat/message', { content: userMessage, matchId: id });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch { toast.error('Failed to send'); }
    finally { setSending(false); }
  };

  const respond = async (action) => {
    try {
      const { data } = await api.post(`/matches/${id}/respond`, { action });
      setMatch(data);
      toast.success(action === 'accept' ? 'Match accepted! Negotiation started.' : 'Match declined.');
    } catch { toast.error('Failed to respond'); }
  };

  const complete = async () => {
    try {
      await api.post(`/matches/${id}/complete`);
      await fetchAll();
      toast.success('🎉 Match marked as completed!');
    } catch { toast.error('Failed to complete match'); }
  };

  const submitRating = async () => {
    try {
      await api.post(`/matches/${id}/rate`, { ratedUserId: ratingUser, score: ratingScore, comment: ratingComment });
      toast.success('Rating submitted! ⭐');
      setShowRating(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Rating failed'); }
  };

  const submitReport = async () => {
    if (!reportReason.trim()) { toast.error('Please describe the issue'); return; }
    const reportedUser = match.participants.find((p) => p._id.toString() !== user._id.toString());
    try {
      await api.post('/reports', { reportedUserId: reportedUser._id, matchId: id, reason: reportReason });
      toast.success('Report submitted. Thank you.');
      setShowReport(false);
    } catch { toast.error('Failed to submit report'); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><div className="spinner" /></div>;
  if (!match)  return <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--color-muted)' }}>Match not found</div>;

  const others = match.participants.filter((p) => p._id.toString() !== user._id.toString());
  const myExchange = match.exchangeSummary?.find((e) => e.userId?.toString() === user._id.toString());
  const isParticipant = match.participants.some((p) => p._id.toString() === user._id.toString());
  const isProposer = match.proposedBy?.toString() === user._id.toString();

  return (
    <div className="page">
      <div className="container">
        {/* ── Match Header ─────────────────────────────── */}
        <div className="glass" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <Users size={20} />
                <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>
                  {match.matchType === 'chain' ? 'Chain Match' : 'Direct Match'}
                </h1>
                <span className={`badge ${statusClass[match.status]}`}>{match.status}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {match.participants.map((p, i) => (
                  <>
                    <span key={p._id} style={{ fontWeight: 600 }}>{p.name}</span>
                    {i < match.participants.length - 1 && <ArrowRight key={`arrow-${i}`} size={16} color="var(--color-muted)" />}
                  </>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {match.status === 'completed' && isParticipant && (
                <button className="btn btn-secondary btn-sm" onClick={() => { setShowRating(true); setRatingUser(others[0]?._id); }} id="rate-btn">
                  <Star size={15} /> Rate
                </button>
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => setShowReport(true)} style={{ color: 'var(--color-muted)' }} id="report-btn">
                <Flag size={15} /> Report
              </button>
            </div>
          </div>

          {/* Exchange Summary */}
          {myExchange && (
            <div style={{ marginTop: '1rem', padding: '0.875rem 1rem', background: 'var(--color-surface2)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="skill-tag">You give: {myExchange.gives}</span>
              <ArrowRight size={16} color="var(--color-muted)" />
              <span className="skill-tag skill-tag-wanted">You get: {myExchange.gets}</span>
            </div>
          )}

          {/* Action buttons */}
          {match.status === 'proposed' && !isProposer && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-primary btn-sm" onClick={() => respond('accept')} id="accept-match-btn">✅ Accept Match</button>
              <button className="btn btn-danger btn-sm" onClick={() => respond('decline')} id="decline-match-btn">❌ Decline</button>
            </div>
          )}
          {['negotiating', 'agreed'].includes(match.status) && isParticipant && (
            <div style={{ marginTop: '1rem' }}>
              <button className="btn btn-primary btn-sm" onClick={complete} id="complete-match-btn">🏁 Mark as Completed</button>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
          {/* ── Negotiation Chat ────────────────────────── */}
          <div className="glass" style={{ display: 'flex', flexDirection: 'column', height: 520 }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="var(--color-primary2)" />
              <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>AI Negotiation Assistant</h2>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {messages.length === 0 && (
                <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
                  Ask the AI to help negotiate sessions, format, and schedule. It will draft a final agreement!
                </p>
              )}
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}
                    style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="chat-bubble chat-bubble-ai" style={{ width: 'fit-content', display: 'flex', gap: '0.375rem', padding: '0.75rem 1rem' }}>
                  <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '0.875rem 1rem', borderTop: '1px solid var(--color-border)' }}>
              <form onSubmit={sendNegotiationMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  className="input"
                  placeholder="Discuss sessions, format, schedule..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={sending}
                  id="negotiation-input"
                  style={{ flex: 1, fontSize: '0.875rem' }}
                />
                <button type="submit" className="btn btn-primary btn-sm" disabled={sending || !input.trim()} id="negotiation-send-btn">
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>

          {/* ── Agreement + Participants ─────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Agreement */}
            <div className="glass" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={18} color="var(--color-success)" /> Barter Agreement
              </h2>
              {match.agreementText ? (
                <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {match.agreementText}
                </p>
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', fontStyle: 'italic' }}>
                  Agreement will be drafted once the match is accepted. Use the chat to negotiate!
                </p>
              )}
            </div>

            {/* Participants profiles */}
            <div className="glass" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Participants</h2>
              {match.participants.map((p) => (
                <div key={p._id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                      {p._id.toString() === user._id.toString() && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginLeft: '0.5rem' }}>(you)</span>
                      )}
                    </div>
                    {p.rating?.count > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: 'var(--color-warning)' }}>
                        <Star size={13} />{p.rating.average.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {p.badges?.map((b) => (
                      <span key={b} style={{ fontSize: '0.6875rem', padding: '0.125rem 0.5rem', background: 'rgba(124,58,237,0.15)', borderRadius: 999, color: 'var(--color-primary2)' }}>{b}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Rating Modal ────────────────────────────── */}
        {showRating && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div className="glass" style={{ padding: '2rem', maxWidth: 400, width: '100%' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Rate Your Partner ⭐</h2>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Select Partner</label>
                <select className="input" value={ratingUser} onChange={(e) => setRatingUser(e.target.value)} id="rating-user-select">
                  {others.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Score</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1,2,3,4,5].map((s) => (
                    <button key={s} className="star" onClick={() => setRatingScore(s)} style={{ color: s <= ratingScore ? 'var(--color-warning)' : 'var(--color-muted)' }}>★</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="label">Comment (optional)</label>
                <textarea className="input" rows={3} value={ratingComment} onChange={(e) => setRatingComment(e.target.value)} id="rating-comment" />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-primary" onClick={submitRating} id="submit-rating-btn">Submit Rating</button>
                <button className="btn btn-ghost" onClick={() => setShowRating(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Report Modal ────────────────────────────── */}
        {showReport && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div className="glass" style={{ padding: '2rem', maxWidth: 400, width: '100%' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Report Issue 🚩</h2>
              <div className="form-group">
                <label className="label">Describe the issue *</label>
                <textarea className="input" rows={4} placeholder="Describe what happened..." value={reportReason} onChange={(e) => setReportReason(e.target.value)} id="report-reason" />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-danger" onClick={submitReport} id="submit-report-btn">Submit Report</button>
                <button className="btn btn-ghost" onClick={() => setShowReport(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
