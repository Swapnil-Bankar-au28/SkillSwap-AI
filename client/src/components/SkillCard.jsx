// src/components/SkillCard.jsx
// Displays a single skill (offered or wanted) with a delete button

import { X } from 'lucide-react';

export default function SkillCard({ skill, type = 'offered', onDelete }) {
  const isOffered = type === 'offered';

  return (
    <div className="glass glass-hover" style={{
      padding: '1rem 1.25rem',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '0.75rem',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{skill.skillName}</span>
          <span className={`skill-tag ${isOffered ? '' : 'skill-tag-wanted'}`}>
            {isOffered ? skill.proficiency : skill.urgency + ' urgency'}
          </span>
          {skill.category && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', background: 'var(--color-surface2)', padding: '0.1rem 0.5rem', borderRadius: 999 }}>
              {skill.category}
            </span>
          )}
        </div>
        {skill.description && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', lineHeight: 1.4 }}>
            {skill.description}
          </p>
        )}
      </div>
      {onDelete && (
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onDelete(skill._id)}
          style={{ flexShrink: 0, padding: '0.25rem', color: 'var(--color-muted)' }}
          title="Remove skill"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
