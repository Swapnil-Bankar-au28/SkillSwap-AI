// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import MatchCard from '../components/MatchCard';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Search, CheckCircle2, Clock, Star, Award,
  Trophy, Flame, GitBranch, Plus
} from 'lucide-react';

const BADGE_ICONS = {
  'First Swap':          <Star size={16} />,
  '5 Swaps Completed':   <Trophy size={16} />,
  'Chain Match Pioneer': <GitBranch size={16} />,
};

export default function Dashboard() {
  const { user } = useAuth();
  const [matches, setMatches]         = useState([]);
  const [candidates, setCandidates]   = useState({ directMatches: [], chainMatches: [] });
  const [loading, setLoading]         = useState(true);
  const [searching, setSearching]     = useState(false);
  const [activeTab, setActiveTab]     = useState('active');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data } = await api.get('/matches');
      setMatches(data);
    } catch {
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const runMatching = async () => {
    setSearching(true);
    try {
      const { data } = await api.get('/matches/find');
      setCandidates(data);
      const total = data.directMatches.length + data.chainMatches.length;
      toast.success(total > 0 ? `Found ${total} potential matches!` : 'No matches found yet — add more skills!');
    } catch {
      toast.error('Matching failed');
    } finally {
      setSearching(false);
    }
  };

  const filtered = (status) => matches.filter((m) => {
    if (status === 'active')    return ['proposed', 'negotiating', 'agreed'].includes(m.status);
    if (status === 'completed') return m.status === 'completed';
    if (status === 'cancelled') return m.status === 'cancelled';
    return true;
  });

  const tabs = [
    { key: 'active',    label: 'Active',    count: filtered('active').length },
    { key: 'completed', label: 'Completed', count: filtered('completed').length },
  ];

  return (
    <div className="page">
      <div className="container">
        {/* ── Header ─────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 className="page-title">
              <LayoutDashboard size={28} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
              Dashboard
            </h1>
            <p className="page-subtitle">Welcome back, {user?.name?.split(' ')[0]} 👋</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={runMatching} disabled={searching} id="run-matching-btn">
              {searching ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <Search size={16} />}
              {searching ? 'Searching...' : 'Find Matches'}
            </button>
            <Link to="/chat">
              <button className="btn btn-primary" id="go-to-chat-btn">
                <Plus size={16} /> Chat with AI
              </button>
            </Link>
          </div>
        </div>

        {/* ── Stats Row ──────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Active Swaps',    value: filtered('active').length,    icon: <Flame size={20} />, color: '#f59e0b' },
            { label: 'Completed',       value: filtered('completed').length,  icon: <CheckCircle2 size={20} />, color: '#10b981' },
            { label: 'Badges Earned',   value: user?.badges?.length || 0,     icon: <Award size={20} />, color: '#7c3aed' },
            { label: 'Rating',          value: user?.rating?.average?.toFixed(1) || '—', icon: <Star size={20} />, color: '#06b6d4' },
          ].map((stat) => (
            <div key={stat.label} className="glass" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ color: stat.color, marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>{stat.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
          {/* ── Main Content ──────────────────────────── */}
          <div>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: 'var(--color-surface)', padding: '0.375rem', borderRadius: 12, border: '1px solid var(--color-border)', width: 'fit-content' }}>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`btn btn-sm ${activeTab === tab.key ? 'btn-primary' : 'btn-ghost'}`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span style={{ background: activeTab === tab.key ? 'rgba(255,255,255,0.25)' : 'var(--color-surface2)', borderRadius: 999, padding: '0 0.4rem', fontSize: '0.75rem' }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <div className="spinner" />
              </div>
            ) : filtered(activeTab).length === 0 ? (
              <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
                <Clock size={40} style={{ color: 'var(--color-muted)', margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--color-muted)' }}>
                  {activeTab === 'active' ? 'No active swaps yet. Run matching to find partners!' : 'No completed swaps yet.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filtered(activeTab).map((m) => <MatchCard key={m._id} match={m} />)}
              </div>
            )}

            {/* Candidate Matches */}
            {(candidates.directMatches.length > 0 || candidates.chainMatches.length > 0) && (
              <div style={{ marginTop: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                  🎯 Potential Matches Found
                </h2>
                {candidates.directMatches.slice(0, 3).map((m, i) => (
                  <div key={i} className="glass" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <span className="badge badge-negotiating" style={{ marginBottom: '0.5rem' }}>Direct Match</span>
                        <div style={{ fontWeight: 600 }}>
                          {m.participants.map((p) => p.name).join(' ↔ ')}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', marginTop: '0.25rem' }}>
                          Score: {m.score}
                        </div>
                      </div>
                      <Link to="/chat">
                        <button className="btn btn-primary btn-sm">Discuss with AI</button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Sidebar ───────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Badges */}
            <div className="glass" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={18} /> Badges
              </h3>
              {user?.badges?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {user.badges.map((badge) => (
                    <div key={badge} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.875rem', background: 'rgba(124,58,237,0.1)', borderRadius: 10, border: '1px solid rgba(124,58,237,0.2)' }}>
                      <span style={{ color: 'var(--color-primary2)' }}>{BADGE_ICONS[badge] || <Star size={16} />}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{badge}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
                  Complete your first swap to earn badges! 🏆
                </p>
              )}
            </div>

            {/* Quick Links */}
            <div className="glass" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/profile"><button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>✏️ Edit Skills</button></Link>
                <Link to="/chat"><button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>🤖 AI Matchmaker</button></Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
