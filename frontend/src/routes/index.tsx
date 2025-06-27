import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

// ✅ nodeIntegration 为 true 时可以用 require
const { ipcRenderer } = window.require('electron')

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const [image, setImage] = useState<string | null>(null)
  const [log, setLog] = useState('')

  const appendLog = (msg: string) => {
    console.log(msg)
    setLog(prev => prev + msg + '\n')
  }

  async function captureScreen(): Promise<string | null> {
    try {
      appendLog('🟡 尝试调用 getDisplayMedia...')
      const stream = await navigator.mediaDevices.getDisplayMedia({
       
        audio:false
      })

      appendLog('🟢 成功获取屏幕流，开始绘制视频帧')
      const video = document.createElement('video')
      video.srcObject = stream

      await video.play()

      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        appendLog('❌ 获取 canvas context 失败')
        return null
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const base64 = canvas.toDataURL('image/png')

      stream.getTracks().forEach(track => track.stop())
      appendLog('✅ 成功生成截图 base64')

      return base64
    } catch (err: any) {
      appendLog(`❌ 捕捉屏幕失败：${err.message}`)
      return null
    }
  }

  const handleScreenshot = async () => {
    appendLog('📸 开始截图流程...')
    const base64 = await captureScreen()
    if (!base64) {
      appendLog('❌ 截图 base64 为空，截图中断')
      return
    }

    appendLog('📤 正在发送 base64 给主进程打开编辑器...')
    const result = await ipcRenderer.invoke('open-screenshot-editor', base64)
    appendLog(result ? '✅ 编辑器窗口已打开' : '❌ 编辑器窗口未成功打开')

    setImage(base64)
  }

  return (
    <div className="p-6">
      <div
        onClick={handleScreenshot}
        className="cursor-pointer border rounded-lg p-4 shadow hover:bg-gray-100 transition mb-4"
      >
        📸 测试截图逻辑（点击执行）
      </div>

      <pre className="whitespace-pre-wrap text-sm text-gray-700 mb-4 bg-gray-100 p-2 rounded">
        {log || '📄 日志输出会显示在这里…'}
      </pre>

      {image && (
        <div>
          <h2 className="text-lg font-bold mb-2">🖼️ 截图预览：</h2>
          <img src={image} alt="截图" className="border rounded max-w-full" />
        </div>
      )}
    </div>
  )
}
