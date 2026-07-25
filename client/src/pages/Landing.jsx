// src/pages/Landing.jsx
import { Link } from 'react-router-dom';
import { Zap, Users, Bot, Shield, ArrowRight, Star, GitBranch } from 'lucide-react';

const features = [
  {
    icon: <Bot size={28} />,
    title: 'AI-Powered Matching',
    description: 'Describe your skills in plain language. Our Claude AI extracts structured data and finds your perfect barter partner.',
    color: '#7c3aed',
  },
  {
    icon: <GitBranch size={28} />,
    title: 'Chain Matching',
    description: 'No direct partner? Our graph algorithm finds 3-way and 4-way barter chains so everyone gets what they need.',
    color: '#06b6d4',
  },
  {
    icon: <Users size={28} />,
    title: 'Skill Negotiation',
    description: 'The AI facilitates negotiation between matched users, drafting a clear barter agreement both parties can agree on.',
    color: '#10b981',
  },
  {
    icon: <Shield size={28} />,
    title: 'Trust & Ratings',
    description: 'After every swap, rate your partner. Build your reputation and earn badges like "Chain Match Pioneer".',
    color: '#f59e0b',
  },
];

const exampleSwaps = [
  { from: 'Guitar Lessons', to: 'Logo Design', fromUser: 'Alex', toUser: 'Maya' },
  { from: 'Python Tutoring', to: 'Yoga Classes', fromUser: 'Priya', toUser: 'Sam' },
  { from: 'Video Editing', to: 'French Lessons', fromUser: 'Chris', toUser: 'Sophie' },
];

export default function Landing() {
  return (
    <div style={{ overflowX: 'hidden' }}>
      {/* ── Hero Section ─────────────────────────────── */}
      <section style={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        padding: '4rem 0',
        overflow: 'hidden',
      }}>
        {/* Background glow orbs */}
        <div style={{
          position: 'absolute', top: '20%', left: '10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '5%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: 999, padding: '0.375rem 1rem', marginBottom: '2rem',
            fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary2)',
          }}>
            <Zap size={14} /> Powered by Claude AI
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem' }}>
            Exchange Skills,<br />
            <span className="gradient-text">Not Money</span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--color-muted)', maxWidth: 600, margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            SkillSwap AI matches you with people who have what you need and need what you have.
            No cash, no contracts — just human skills and mutual growth.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register">
              <button className="btn btn-primary btn-lg">
                Start Swapping <ArrowRight size={18} />
              </button>
            </Link>
            <Link to="/login">
              <button className="btn btn-secondary btn-lg">
                Sign In
              </button>
            </Link>
          </div>

          {/* Example swaps ticker */}
          <div style={{ marginTop: '4rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {exampleSwaps.map((s, i) => (
              <div key={i} className="glass" style={{ padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{s.fromUser}</p>
                  <span className="skill-tag">{s.from}</span>
                </div>
                <ArrowRight size={18} color="var(--color-muted)" />
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{s.toUser}</p>
                  <span className="skill-tag skill-tag-wanted">{s.to}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────── */}
      <section style={{ padding: '5rem 0', background: 'var(--color-surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>How It Works</h2>
            <p style={{ color: 'var(--color-muted)' }}>Three simple steps to your first skill swap</p>
          </div>

          <div className="grid-3">
            {[
              { step: '01', title: 'List Your Skills', desc: 'Tell the AI what you can teach and what you want to learn — in plain English.' },
              { step: '02', title: 'Get Matched', desc: 'Our graph algorithm finds direct matches and multi-person chains that work for everyone.' },
              { step: '03', title: 'Swap & Grow', desc: 'Chat, negotiate terms, and execute your barter. Rate each other when done.' },
            ].map((item) => (
              <div key={item.step} className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{
                  fontSize: '2.5rem', fontWeight: 900, lineHeight: 1,
                  background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent', marginBottom: '1rem',
                }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.9375rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Everything You Need</h2>
            <p style={{ color: 'var(--color-muted)' }}>Built for college students and professionals alike</p>
          </div>

          <div className="grid-2">
            {features.map((f) => (
              <div key={f.title} className="glass glass-hover" style={{ padding: '2rem', display: 'flex', gap: '1.25rem' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${f.color}20`, color: f.color, border: `1px solid ${f.color}30`,
                }}>
                  {f.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.0625rem', marginBottom: '0.375rem' }}>{f.title}</h3>
                  <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div className="container">
          <div className="glass" style={{
            padding: '4rem 2rem',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.1) 100%)',
            border: '1px solid rgba(124,58,237,0.3)',
            maxWidth: 700, margin: '0 auto',
          }}>
            <Star size={40} style={{ marginBottom: '1rem', color: 'var(--color-warning)' }} />
            <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Ready to Start Swapping?</h2>
            <p style={{ color: 'var(--color-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
              Join the community of skill-swappers. Your next learning opportunity is one match away.
            </p>
            <Link to="/register">
              <button className="btn btn-primary btn-lg">
                Create Free Account <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
