import { useEffect, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ipcRenderer } from 'electron'

let remote: any

if (typeof window !== 'undefined') {
  try {
    remote = window.require?.('electron')?.remote
  } catch (e) {
    console.warn('Electron remote unavailable')
  }
}

export const Route = createFileRoute('/float_ball')({
  component: RouteComponent,
})

function RouteComponent() {
  const biasRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!remote) return
    const win = remote.getCurrentWindow()

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      biasRef.current = { x: e.x, y: e.y }
      document.addEventListener('mousemove', handleMouseMove)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }

    const handleMouseMove = (e: MouseEvent) => {
      win.setPosition(e.screenX - biasRef.current.x, e.screenY - biasRef.current.y)
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousemove', handleMouseMove)
    }
    
  }, [])

  return (
    <div style={styles.page} onClick={() => {
    ipcRenderer.send('toggle-main-window')
  }}>
      <div style={styles.ball}>悬浮球</div>

    </div>
  )
}

const styles = {
  wrapper: {
    width: '100px',
    height: '100px',
    backgroundColor: 'transparent',
    overflow: 'hidden',
    margin: 0,
    padding: 0,
  },
  ball: {
    width: '100px',
    height: '100px',
    backgroundColor: '#409EFF',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
    userSelect: 'none',
  },
}