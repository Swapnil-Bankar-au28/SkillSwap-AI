// src/components/MatchCard.jsx
// Displays a barter match card for the dashboard

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Users, Link2 } from 'lucide-react';

const statusClass = {
  proposed:    'badge-proposed',
  negotiating: 'badge-negotiating',
  agreed:      'badge-agreed',
  completed:   'badge-completed',
  cancelled:   'badge-cancelled',
};

export default function MatchCard({ match }) {
  const { user } = useAuth();

  // Get the other participant(s)
  const others = match.participants.filter(
    (p) => p._id !== user?._id && p._id.toString() !== user?._id?.toString()
  );

  // Find the current user's exchange entry
  const myExchange = match.exchangeSummary?.find(
    (e) => e.userId?.toString() === user?._id?.toString()
  );

  return (
    <Link to={`/matches/${match._id}`}>
      <div className="glass glass-hover" style={{ padding: '1.25rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {match.matchType === 'chain' ? <Link2 size={16} /> : <Users size={16} />}
            <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
              {match.matchType === 'chain' ? 'Chain Match' : 'Direct Match'}
            </span>
          </div>
          <span className={`badge ${statusClass[match.status] || ''}`}>
            {match.status}
          </span>
        </div>

        {/* Participants */}
        <div style={{ marginBottom: '0.75rem' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', marginBottom: '0.25rem' }}>With</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {others.map((p) => (
              <span key={p._id} style={{
                padding: '0.2rem 0.75rem',
                background: 'var(--color-surface2)',
                borderRadius: 999,
                fontSize: '0.875rem',
                fontWeight: 500,
              }}>
                {p.name}
              </span>
            ))}
          </div>
        </div>

        {/* Exchange */}
        {myExchange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
            <span className="skill-tag">{myExchange.gives}</span>
            <ArrowRight size={14} color="var(--color-muted)" />
            <span className="skill-tag skill-tag-wanted">{myExchange.gets}</span>
          </div>
        )}

        {/* Date */}
        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '0.75rem' }}>
          {new Date(match.createdAt).toLocaleDateString()}
        </p>
      </div>
    </Link>
  );
}
