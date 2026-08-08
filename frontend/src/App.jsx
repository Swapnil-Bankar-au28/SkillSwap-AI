import { useState, useEffect, useRef } from 'react'
import ChatInput from './components/ChatInput'
import PipelineProgress from './components/PipelineProgress'
import VideoPlayer from './components/VideoPlayer'
import Viewer3D from './components/Viewer3D'

// Auto-detect: use local proxy when on localhost, Render backend when on Vercel/production
const IS_LOCAL = window?.location?.hostname === 'localhost' || window?.location?.hostname === '127.0.0.1'
const API_BASE = IS_LOCAL ? '' : (import.meta.env.VITE_API_URL || 'https://eduvis-ai-backend.onrender.com')

const FEATURES = [
  { icon: '🤖', title: 'Multi-Agent AI', desc: 'Specialized agents for research, animation, and fact verification' },
  { icon: '🎬', title: 'Manim Animations', desc: 'Mathematically precise 2D animations, not slides' },
  { icon: '🧊', title: '3D Molecular View', desc: 'Rotatable 3D structures via 3Dmol.js + RDKit' },
  { icon: '✅', title: 'Fact Verified', desc: 'Built-in critique loop catches chemical errors before you see them' },
  { icon: '🎓', title: 'Grade 1 → PhD', desc: 'Level-adaptive narration and visual complexity' },
  { icon: '🔊', title: 'Auto Narration', desc: 'TTS audio synced to each animation scene' },
]

export default function App() {
  const [appState, setAppState] = useState('idle')  // idle | running | done | error
  const [runId, setRunId] = useState(null)
  const [topic, setTopic] = useState('')
  const [stage, setStage] = useState('')
  const [stageMsg, setStageMsg] = useState('')
  const [progress, setProgress] = useState(0)
  const [videoUrl, setVideoUrl] = useState(null)
  const [viewer3dConfigs, setViewer3dConfigs] = useState(null)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)

  const wsRef = useRef(null)
  const pollRef = useRef(null)

  const handleSubmit = async (questionText, verifierEnabled) => {
    setTopic(questionText)
    setAppState('running')
    setStage('classify')
    setStageMsg('Starting pipeline...')
    setProgress(0.02)
    setVideoUrl(null)
    setViewer3dConfigs(null)
    setSummary(null)
    setError(null)

    try {
      const res = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: questionText, verifier_enabled: verifierEnabled }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Pipeline start failed')
      }

      const { run_id } = await res.json()
      setRunId(run_id)

      // Connect WebSocket for real-time updates
      connectWebSocket(run_id)

      // Poll as fallback in case WS fails
      pollRef.current = setInterval(() => pollStatus(run_id), 3000)

    } catch (e) {
      setError(e.message)
      setAppState('error')
    }
  }

  const connectWebSocket = (id) => {
    try {
      let wsUrl;
      if (API_BASE) {
        // Production: derive ws URL from API_BASE (e.g. Render)
        const wsProtocol = API_BASE.startsWith('https') ? 'wss:' : 'ws:';
        const wsHost = API_BASE.replace(/^https?:\/\//, '');
        wsUrl = `${wsProtocol}//${wsHost}/ws/${id}`;
      } else {
        // Local dev: always connect to localhost:8000 directly
        wsUrl = `ws://localhost:8000/ws/${id}`;
      }
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleServerMessage(data)
        } catch (_) {}
      }
      ws.onerror = () => {
        // WS failed — HTTP status polling handles status updates
      }
    } catch (_) {
      // WS error / unsupported on serverless — HTTP status polling handles status updates
    }
  }

  const pollStatus = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/status/${id}`)
      if (!res.ok) return
      const data = await res.json()

      setStage(data.current_stage || stage)
      setStageMsg(data.stage_message || stageMsg)
      setProgress(data.progress)

      if (data.status === 'done') {
        clearInterval(pollRef.current)
        wsRef.current?.close()
        setAppState('done')
        if (data.video_url) setVideoUrl(data.video_url)
        if (data.viewer_3d_configs) setViewer3dConfigs(data.viewer_3d_configs)
        if (data.result_summary) setSummary(data.result_summary)
      } else if (data.status === 'error') {
        clearInterval(pollRef.current)
        setAppState('error')
        setError(data.error || 'Unknown pipeline error')
      }
    } catch (_) {}
  }

  const handleServerMessage = (data) => {
    if (data.type === 'progress') {
      setStage(data.stage)
      setStageMsg(data.message)
      setProgress(data.progress)
    } else if (data.type === 'complete') {
      setProgress(1.0)
      setAppState('done')
      if (data.video_url) setVideoUrl(data.video_url)
    } else if (data.type === 'error') {
      setAppState('error')
      setError(data.error)
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearInterval(pollRef.current)
      wsRef.current?.close()
    }
  }, [])

  const resetToIdle = () => {
    setAppState('idle')
    setRunId(null)
    setVideoUrl(null)
    setViewer3dConfigs(null)
    setSummary(null)
    setError(null)
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">⚡</div>
          <div>
            <div className="logo-text">EduVis AI</div>
            <div className="logo-sub">Grade 1 → PhD · Any Subject</div>
          </div>
        </div>
        <div className="header-badge">Multi-Agent Pipeline</div>
      </header>

      {/* Hero + Input */}
      {appState === 'idle' && (
        <>
          <section className="hero">
            <div className="hero-eyebrow">
              ✨ Powered by Gemini + Manim + 3Dmol.js
            </div>
            <h1 className="hero-title">
              Any Question.<br />
              Any Subject.<br />
              <span style={{ color: 'var(--accent-primary)' }}>Beautiful Animated Video.</span>
            </h1>
            <p className="hero-subtitle">
              Type any topic — from "why is the sky blue?" to "Diels-Alder transition state" —
              and get a narrated, animated explainer video with 3D molecular views in seconds.
            </p>
          </section>

          <ChatInput onSubmit={handleSubmit} isLoading={false} />

          <div className="features-row">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Running — show progress */}
      {appState === 'running' && (
        <>
          <div style={{ padding: '32px 24px 0', textAlign: 'center', position: 'relative', zIndex: 5 }}>
            <button
              onClick={resetToIdle}
              style={{
                background: 'none', border: '1px solid var(--border)',
                color: 'var(--text-muted)', padding: '6px 14px', borderRadius: '8px',
                cursor: 'pointer', fontSize: '0.8rem',
              }}
            >
              ← Cancel
            </button>
          </div>
          <PipelineProgress
            topic={topic}
            stage={stage}
            message={stageMsg}
            progress={progress}
            status="running"
          />
        </>
      )}

      {/* Error state */}
      {appState === 'error' && (
        <div className="progress-section">
          <div className="error-card fade-in">
            <div className="error-title">⚠ Pipeline Error</div>
            <div>{error}</div>
            <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Make sure GOOGLE_API_KEY is set in your .env file and the backend is running.
            </div>
            <button
              onClick={resetToIdle}
              style={{
                marginTop: '14px', background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5',
                padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Done — show result */}
      {appState === 'done' && (
        <>
          <div style={{ padding: '28px 24px 16px', textAlign: 'center', position: 'relative', zIndex: 5 }}>
            <div style={{ color: 'var(--accent-green)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '8px' }}>
              ✓ Video ready!
            </div>
            <button
              onClick={resetToIdle}
              style={{
                background: 'none', border: '1px solid var(--border)',
                color: 'var(--text-muted)', padding: '6px 14px', borderRadius: '8px',
                cursor: 'pointer', fontSize: '0.8rem',
              }}
            >
              ← Ask another question
            </button>
          </div>

          <div className="result-section">
            <div className="result-grid">
              {/* Left: video player */}
              <div>
                {videoUrl ? (
                  <VideoPlayer videoUrl={videoUrl} topic={topic} summary={summary} />
                ) : (
                  <div className="video-card" style={{ padding: '40px', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      ⚠ Video file not available. Manim may not be installed.
                      <br />
                      <a href="/INSTALL.md" style={{ color: 'var(--text-accent)' }}>See INSTALL.md</a>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: 3D viewer + info */}
              <div className="sidebar-stack">
                <Viewer3D configs={viewer3dConfigs} />

                {summary && (
                  <div className="info-card fade-in">
                    {Object.entries(summary).map(([k, v]) => (
                      <div key={k} className="info-row">
                        <span className="info-key">{k.replace(/_/g, ' ')}</span>
                        <span className="info-val">{typeof v === 'number' ? v.toFixed(v % 1 ? 1 : 0) : v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
