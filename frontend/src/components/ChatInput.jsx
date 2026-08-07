import { useState, useRef, useEffect } from 'react'

const EXAMPLE_QUESTIONS = [
  "Why is the sky blue?",
  "SN2 reaction mechanism",
  "How does DNA replication work?",
  "Explain photosynthesis",
  "What is quantum entanglement?",
  "Le Chatelier's principle",
  "Euler's formula derivation",
  "How does a transistor work?",
]

export default function ChatInput({ onSubmit, isLoading }) {
  const [value, setValue] = useState('')
  const [verifierEnabled, setVerifierEnabled] = useState(true)
  const textareaRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }, [value])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed || isLoading) return
    onSubmit(trimmed, verifierEnabled)
    setValue('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="chat-input-wrapper fade-in">
      <div className="chat-input-container">
        <textarea
          ref={textareaRef}
          className="chat-input-field"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything — SN2 reaction, photosynthesis, quantum mechanics, calculus..."
          rows={1}
          disabled={isLoading}
          id="topic-input"
        />
        <button
          className="chat-submit-btn"
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
          title="Generate video (Enter)"
          id="generate-btn"
        >
          {isLoading ? '⏳' : '🎬'}
        </button>
      </div>

      <div className="chat-options">
        <div
          className={`option-toggle ${verifierEnabled ? 'active' : ''}`}
          onClick={() => setVerifierEnabled(!verifierEnabled)}
          id="verifier-toggle"
          role="button"
          tabIndex={0}
        >
          <div className="toggle-dot" />
          Fact Verification Loop
        </div>
        <div className="option-toggle" style={{ cursor: 'default', opacity: 0.7 }}>
          🎧 Auto TTS narration
        </div>
        <div className="option-toggle" style={{ cursor: 'default', opacity: 0.7 }}>
          🧊 3D molecule viewer
        </div>
      </div>

      <div className="example-chips">
        {EXAMPLE_QUESTIONS.map((q) => (
          <button
            key={q}
            className="chip"
            onClick={() => setValue(q)}
            id={`chip-${q.replace(/\s+/g, '-').toLowerCase().slice(0, 20)}`}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
