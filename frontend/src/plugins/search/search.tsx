import { useState } from 'react';
import { Input, Space, List, Avatar, Button } from '@arco-design/web-react';
import '@arco-design/web-react/dist/css/arco.css';
import { ipcRenderer } from 'electron';

const InputSearch = Input.Search; // ← 在这里定义

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [plugins, setPlugins] = useState<
    { name: string; icon: string; dir: string; iconDataUrl: string }[]
  >([]);
  const [keyword, setKeyword] = useState('');

  // 截屏方法
  async function captureScreen(): Promise<string | null> {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: false,
      });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      stream.getTracks().forEach((t) => t.stop());
      return canvas.toDataURL('image/png');
    } catch {
      return null;
    }
  }

  async function handleCapture() {
    // 1. 最小化主窗口
    await ipcRenderer.invoke('minimize-main-window');

    // 2. 等个几百毫秒让窗口完成最小化和重绘
    setTimeout(async () => {
      // 3. 真正去截屏
      const base64 = await captureScreen();
      if (!base64) {
        // 用户取消截屏时让主窗口恢复
        ipcRenderer.send('screenshot-cancel');
        return;
      }

      // 4. 打开截图编辑器
      await ipcRenderer.invoke('open-screenshot-editor', base64);

      // 5. （可选）存一下当前截图数据到 state
      setImage(base64);
    }, 200);
  }

  // 搜索插件
  const handleChange = async (value: string) => {
    setKeyword(value);
    const allPlugins = (await ipcRenderer.sendSync('search-plugins')) as {
      name: string;
      icon: string;
      dir: string;
      iconDataUrl: string;
    }[];
    if (Array.isArray(allPlugins)) {
      setPlugins(
        allPlugins.filter((p) =>
          p.name.toLowerCase().includes(value.toLowerCase())
        )
      );
    }
  };

  return (
    <Space direction="vertical" style={{ width: 350, margin: '20px auto' }}>
      <InputSearch
        searchButton
        placeholder="输入插件名搜索"
        style={{ width: 350 }}
        onChange={handleChange}
        value={keyword}
      />

      {keyword && (
        <List
          dataSource={plugins}
          render={(item) => (
            <List.Item
              key={item.dir}
              style={{ cursor: 'pointer' }}
              title="点击打开插件并截图"
            >
              <List.Item.Meta
                avatar={
                  <Avatar shape="square">
                    <img src={item.iconDataUrl} alt={item.name} />
                  </Avatar>
                }
                title={
                  <Space>
                    {item.name}
                    <Button size="mini" onClick={handleCapture}>
                      截图
                    </Button>
                  </Space>
                }
                description={item.dir}
              />
            </List.Item>
          )}
        />
      )}

      {/* 可选：展示已截取的图片 */}
      {image && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <img
            src={image}
            alt="Screenshot Preview"
            style={{ maxWidth: '100%', boxShadow: '0 0 8px rgba(0,0,0,0.2)' }}
          />
        </div>
      )}
    </Space>
  );
}
