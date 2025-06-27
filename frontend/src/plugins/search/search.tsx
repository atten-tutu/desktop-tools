import  { useState } from 'react';
import { Input, Space, List, Avatar } from '@arco-design/web-react';
import "@arco-design/web-react/dist/css/arco.css";
import {  ipcRenderer } from 'electron';
const InputSearch = Input.Search;

const App = () => {
  const [plugins, setPlugins] = useState<{ name: string; icon: string; dir: string; iconDataUrl: string }[]>([]);
  const [keyword, setKeyword] = useState('');

  const handleChange = async (value: string) => {
    setKeyword(value);
    // 调用主进程接口获取所有插件
    const allPlugins = await ipcRenderer.sendSync('search-plugins') as { name: string; icon: string; dir: string; iconDataUrl: string }[];
    if (Array.isArray(allPlugins)) {
      // 过滤搜索
      const filtered = allPlugins.filter(
        (p: { name: string; icon: string; dir: string; iconDataUrl: string }) => p.name.toLowerCase().includes(value.toLowerCase())
      );
      setPlugins(filtered);
    }
    console.log("do something");
    console.log(plugins);
  };

  return (
    <Space direction="vertical" style={{ width: 350 }}>
      <InputSearch
        searchButton
        placeholder='输入插件名搜索'
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
            onClick={() => ipcRenderer.send('open-plugin',item.name)}
            style={{ cursor: 'pointer' }}
            title="点击打开插件"
            >
              <List.Item.Meta
                avatar={<Avatar shape="square"><img src={item.iconDataUrl} alt={item.name}/></Avatar>}
                title={item.name}
                description={item.dir}
              />
            </List.Item>
          )}
        />
      )}
    </Space>
  );
};

export default App;