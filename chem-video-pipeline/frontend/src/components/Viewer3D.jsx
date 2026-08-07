import { useEffect, useRef, useState } from 'react'

/**
 * 3D Molecular Viewer using 3Dmol.js (loaded via CDN in index.html).
 * Renders rotatable, zoomable 3D molecular structures from SMILES strings.
 */
export default function Viewer3D({ configs }) {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)
  const [selectedScene, setSelectedScene] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const sceneIds = configs ? Object.keys(configs) : []

  // Pick first scene with a molecule_3d config on mount
  useEffect(() => {
    if (sceneIds.length > 0 && !selectedScene) {
      setSelectedScene(sceneIds[0])
    }
  }, [sceneIds])

  useEffect(() => {
    if (!selectedScene || !configs?.[selectedScene]) return
    const config = configs[selectedScene]

    // Only render if we have 3Dmol config
    if (config.viewer_type !== '3dmol' && config.viewer_type !== 'threejs_orbital') return

    renderViewer(config)
  }, [selectedScene, configs])

  const renderViewer = async (config) => {
    if (!containerRef.current) return

    setIsLoading(true)
    setError(null)

    // Wait for 3Dmol.js to load
    const wait3Dmol = () => new Promise((resolve) => {
      if (window.$3Dmol) return resolve()
      const interval = setInterval(() => {
        if (window.$3Dmol) { clearInterval(interval); resolve() }
      }, 100)
      setTimeout(() => { clearInterval(interval); resolve() }, 5000)
    })

    await wait3Dmol()

    if (!window.$3Dmol) {
      setError('3Dmol.js failed to load. Check your internet connection.')
      setIsLoading(false)
      return
    }

    try {
      // Clear previous viewer
      if (viewerRef.current) {
        viewerRef.current.clear()
      }
      containerRef.current.innerHTML = ''

      const viewer = window.$3Dmol.createViewer(containerRef.current, {
        backgroundColor: config.background_color || '#0d0d1a',
        antialias: true,
      })
      viewerRef.current = viewer

      // Load molecules from SMILES (3Dmol can parse SMILES via SDF)
      const molecules = config.molecules || (config.smiles ? [{ smiles: config.smiles }] : [])
      for (const mol of molecules) {
        if (mol.smiles) {
          // Use 3Dmol's built-in SMILES → 3D converter
          viewer.addModel(mol.smiles, 'smiles', { keepH: true })
        }
      }

      // Apply style
      viewer.setStyle(
        {},
        {
          stick: { radius: 0.15, colorscheme: 'Jmol' },
          sphere: { radius: 0.4, colorscheme: 'Jmol', opacity: 0.85 },
        }
      )

      // Zoom and center
      viewer.zoomTo()
      const zoom = config.camera?.zoom || 1.5
      viewer.zoom(zoom)

      // Add labels if present
      if (config.labels) {
        for (const lbl of config.labels) {
          viewer.addLabel(lbl.text, {
            position: { x: lbl.position[0], y: lbl.position[1], z: lbl.position[2] },
            backgroundColor: 'black',
            fontColor: lbl.color || 'white',
            fontSize: 14,
          })
        }
      }

      viewer.render()

      // Auto-rotate
      if (config.rotation_animation) {
        viewer.rotate(1, config.rotation_animation.axis || 'y')
        const rotateInterval = setInterval(() => {
          if (!viewerRef.current) { clearInterval(rotateInterval); return }
          viewer.rotate(1, config.rotation_animation.axis || 'y')
          viewer.render()
        }, 33)
        // Stop rotation on user interaction
        containerRef.current.addEventListener('mousedown', () => clearInterval(rotateInterval), { once: true })
      }

      setIsLoading(false)
    } catch (err) {
      console.error('[Viewer3D]', err)
      setError('Failed to render molecule. ' + err.message)
      setIsLoading(false)
    }
  }

  if (!configs || sceneIds.length === 0) {
    return (
      <div className="viewer3d-card fade-in">
        <div className="viewer3d-header">
          <span className="viewer3d-title">🧊 3D Molecular Viewer</span>
          <span className="viewer3d-badge">Interactive</span>
        </div>
        <div className="viewer3d-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No 3D structures in this video
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="viewer3d-card fade-in">
      <div className="viewer3d-header">
        <span className="viewer3d-title">🧊 3D Molecular Viewer</span>
        <span className="viewer3d-badge">Interactive · Rotatable</span>
      </div>

      <div className="viewer3d-container" id="viewer3d-mount">
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

        {isLoading && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(13,13,26,0.8)', backdropFilter: 'blur(4px)',
          }}>
            <span style={{ color: 'var(--text-accent)', fontSize: '0.85rem' }}>
              ⏳ Loading 3D structure...
            </span>
          </div>
        )}

        {error && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '16px', textAlign: 'center',
          }}>
            <span style={{ color: 'var(--accent-red)', fontSize: '0.8rem' }}>{error}</span>
          </div>
        )}

        <div className="viewer3d-hint">🖱 Drag to rotate • Scroll to zoom</div>
      </div>

      {sceneIds.length > 1 && (
        <div className="scene-selector">
          {sceneIds.map((id) => (
            <button
              key={id}
              className={`scene-btn ${selectedScene === id ? 'active' : ''}`}
              onClick={() => setSelectedScene(id)}
              id={`scene-btn-${id}`}
            >
              {id.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
