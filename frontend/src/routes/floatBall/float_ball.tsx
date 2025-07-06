import { useEffect, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ipcRenderer } from 'electron'
import './float_ball.css'

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
  const [isDragging, setIsDragging] = useState(false)
  const [isAttached, setIsAttached] = useState(false)
  const [attachDirection, setAttachDirection] = useState<'left' | 'right' | 'top' | 'bottom' | null>(null)
  const ballRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!remote) {
      console.warn('Remote not available')
      return
    }
    
    const win = remote.getCurrentWindow()
    if (!win) {
      console.warn('Window not available')
      return
    }

    console.log('Setting up drag handlers for window:', win)

    const handleMouseDown = (e: MouseEvent) => {
      console.log('Mouse down event', e.button, 'at', e.screenX, e.screenY)
      if (e.button !== 0) return // 只处理左键
      
      e.preventDefault()
      e.stopPropagation()
      
      setIsDragging(true)
      
      // 获取当前窗口位置和鼠标位置
      const [currentX, currentY] = win.getPosition()
      console.log('Current window position:', currentX, currentY)
      
      biasRef.current = { 
        x: e.screenX - currentX, 
        y: e.screenY - currentY 
      }
      
      console.log('Bias calculated:', biasRef.current)
      
      // 添加全局事件监听器
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    const handleMouseUp = (e: MouseEvent) => {
      console.log('Mouse up event')
      setIsDragging(false)
      
      // 移除全局事件监听器
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      
      // 检查是否需要吸附到边缘
      setTimeout(() => checkEdgeAttachment(win), 100)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      
      e.preventDefault()
      e.stopPropagation()
      
      const newX = e.screenX - biasRef.current.x
      const newY = e.screenY - biasRef.current.y
      
      console.log('Moving to:', newX, newY, 'from mouse position:', e.screenX, e.screenY)
      
      // 临时移除吸附状态
      setIsAttached(false)
      setAttachDirection(null)
      
      try {
        win.setPosition(newX, newY)
        console.log('Position set successfully')
      } catch (error) {
        console.error('Error setting position:', error)
      }
    }

    const checkEdgeAttachment = (window: any) => {
      try {
        const [x, y] = window.getPosition()
        const { width, height } = remote.screen.getPrimaryDisplay().workAreaSize
        
        const ballSize = 100
        const attachmentThreshold = 20 // 距离边缘多少像素时开始吸附
        const hoverMargin = 10 // 为悬停效果留出的边距
        
        let shouldAttach = false
        let direction: 'left' | 'right' | 'top' | 'bottom' | null = null
        
        // 检查左边缘 - 为悬停效果留出空间
        if (x <= attachmentThreshold) {
          shouldAttach = true
          direction = 'left'
          window.setPosition(hoverMargin, y)
        }
        // 检查右边缘 - 为悬停效果留出空间
        else if (x >= width - ballSize - attachmentThreshold) {
          shouldAttach = true
          direction = 'right'
          window.setPosition(width - ballSize - hoverMargin, y)
        }
        // 检查上边缘 - 为悬停效果留出空间
        else if (y <= attachmentThreshold) {
          shouldAttach = true
          direction = 'top'
          window.setPosition(x, hoverMargin)
        }
        // 检查下边缘 - 为悬停效果留出空间
        else if (y >= height - ballSize - attachmentThreshold) {
          shouldAttach = true
          direction = 'bottom'
          window.setPosition(x, height - ballSize - hoverMargin)
        }
        
        setIsAttached(shouldAttach)
        setAttachDirection(direction)
      } catch (error) {
        console.error('Error checking edge attachment:', error)
      }
    }

    // 使用useRef来获取元素，确保事件监听器正确添加
    const ballElement = ballRef.current
    if (ballElement) {
      console.log('Adding mousedown listener to ball element')
      ballElement.addEventListener('mousedown', handleMouseDown as EventListener)
    } else {
      console.warn('Ball element not found')
    }

    return () => {
      if (ballElement) {
        ballElement.removeEventListener('mousedown', handleMouseDown as EventListener)
      }
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
    
  }, [isDragging])

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault()
      e.stopPropagation()
      return // 如果正在拖拽，不触发点击事件
    }
    
    console.log('Float ball clicked')
    // 隐藏悬浮球，显示主窗口
    ipcRenderer.send('toggle-main-window')
  }

  return (
    <div 
      className={`float-ball-wrapper ${isAttached ? `attached-${attachDirection}` : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={handleClick}
    >
      <div ref={ballRef} className="float-ball">
        <div className="float-ball-content">
          <div className="float-ball-icon">⚡</div>
          <div className="float-ball-text">工具</div>
        </div>
      </div>
    </div>
  )
} 