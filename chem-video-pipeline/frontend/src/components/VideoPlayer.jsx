import { useRef } from 'react'

export default function VideoPlayer({ videoUrl, topic, summary }) {
  const videoRef = useRef(null)

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = videoUrl
    a.download = `${topic.replace(/\s+/g, '_').slice(0, 40)}_eduvis.mp4`
    a.click()
  }

  return (
    <div className="video-card fade-in">
      <div className="video-card-header">
        <div className="card-title">🎬 {topic}</div>
        <button className="download-btn" onClick={handleDownload} id="download-video-btn">
          ⬇ Download MP4
        </button>
      </div>

      <div className="video-player-wrap">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          autoPlay
          id="result-video"
          style={{ width: '100%', height: '100%' }}
        >
          Your browser does not support video playback.
        </video>
      </div>

      {summary && (
        <div className="video-stats">
          {summary.subject && (
            <div className="stat-item">
              <div className="stat-label">Subject</div>
              <div className="stat-value">{summary.subject}</div>
            </div>
          )}
          {summary.level && (
            <div className="stat-item">
              <div className="stat-label">Level</div>
              <div className="stat-value">{summary.level.replace('_', ' ')}</div>
            </div>
          )}
          {summary.total_duration_seconds > 0 && (
            <div className="stat-item">
              <div className="stat-label">Duration</div>
              <div className="stat-value">{summary.total_duration_seconds.toFixed(0)}s</div>
            </div>
          )}
          {summary.total_scenes > 0 && (
            <div className="stat-item">
              <div className="stat-label">Scenes</div>
              <div className="stat-value">{summary.total_scenes}</div>
            </div>
          )}
          {typeof summary.total_revision_rounds === 'number' && (
            <div className="stat-item">
              <div className="stat-label">Revision Rounds</div>
              <div className="stat-value">{summary.total_revision_rounds}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
