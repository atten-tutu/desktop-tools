import { Message } from '@arco-design/web-react';
import { myFetch } from '../../utils/api-client';

// 修改 API URL，添加 /api 前缀
const INSTALL_API_URL = 'http://localhost:3771/api/install-plugin';

export const installPlugin = async (pluginName: string) => {
  try {
    // 准备请求数据
    const requestData = {
      name: pluginName
    };

    // 发送 POST 请求到后端 API
    const response = await myFetch(INSTALL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    if (response.status === 200) {
      // 下载文件
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pluginName}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);

      Message.success('插件安装成功');
    } else if (response.status === 404) {
      Message.error('未找到插件，请检查插件名称');
    } else {
      Message.error('插件安装失败，请稍后重试');
    }
  } catch (error) {
    console.error('插件安装失败:', error);
    Message.error('插件安装失败，请稍后重试');
  }
};
