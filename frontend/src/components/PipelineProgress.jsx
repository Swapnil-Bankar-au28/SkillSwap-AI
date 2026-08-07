const STAGES = [
  { id: 'classify',   icon: '🔍', label: 'Classify Topic' },
  { id: 'research',   icon: '📚', label: 'Research & Ground' },
  { id: 'storyboard', icon: '📋', label: 'Plan Scenes' },
  { id: 'animation',  icon: '🎨', label: 'Generate Animations' },
  { id: 'verify',     icon: '✅', label: 'Verify Accuracy' },
  { id: 'narration',  icon: '🔊', label: 'Synthesize Audio' },
  { id: 'assembly',   icon: '🎬', label: 'Assemble Video' },
  { id: 'done',       icon: '🎉', label: 'Complete!' },
]

function getStageIndex(stageId) {
  const idx = STAGES.findIndex(s => s.id === stageId)
  return idx >= 0 ? idx : 0
}

export default function PipelineProgress({ topic, stage, message, progress, status }) {
  const currentIdx = getStageIndex(stage)

  return (
    <div className="progress-section fade-in">
      <div className="progress-card">
        <div className="progress-header">
          <div>
            <div className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
              Generating video for
            </div>
            <div className="progress-topic">"{topic}"</div>
          </div>
          <div className="progress-pct">{Math.round(progress * 100)}%</div>
        </div>

        <div className="stages-list">
          {STAGES.map((s, i) => {
            const isDone = i < currentIdx || status === 'done'
            const isActive = i === currentIdx && status === 'running'
            return (
              <div
                key={s.id}
                className={`stage-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
              >
                <div className="stage-icon">
                  {isDone ? '✓' : s.icon}
                </div>
                <div className="stage-info">
                  <div className="stage-name">{s.label}</div>
                  {isActive && message && (
                    <div className="stage-msg">{message}</div>
                  )}
                </div>
                <div className="stage-status-dot" />
              </div>
            )
          })}
        </div>

        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
