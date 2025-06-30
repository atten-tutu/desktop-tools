import { Message } from '@arco-design/web-react';
import { myFetch } from '../../utils/api-client';

// 修改 API URL，添加 /api 前缀
const API_URL = 'http://47.110.158.139:3771/api/upload-plugin';
const ZIP_UPLOAD_API_URL = 'http://47.110.158.139:3771/api/upload-zip';

export const upload = async (plugin: any) => {
  try {
    // 发送 POST 请求到后端 API
    const response = await myFetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(plugin),
    });

    // 解析响应数据
    const data = await response.json();
    console.log('Upload success:', data);
    Message.success('插件信息上传成功');
  } catch (error) {
    console.error('Upload failed:', error);
    Message.error('插件信息上传失败，请稍后重试');
  }
};

export const uploadZip = async (zipFile: File) => {
  try {
    const formData = new FormData();
    formData.append('zip', zipFile);

    const response = await myFetch(ZIP_UPLOAD_API_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log('Zip upload success:', data);
    Message.success('插件压缩包上传成功');
  } catch (error) {
    console.error('Zip upload failed:', error);
    Message.error('插件压缩包上传失败，请稍后重试');
  }
};
