import React, { useRef } from 'react';
import { Link } from '@tanstack/react-router';


const UploadFolder: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  // 处理文件夹上传
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileArr = Array.from(files);
    fileArr.forEach(file => {
      console.log('文件名:', file.webkitRelativePath || file.name, '大小:', file.size);
    });
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={handleChange}
        style={{ display: 'none' }}
        // @ts-ignore
        webkitdirectory="true"
        // @ts-ignore
        directory="true"
      />
      <button
        onClick={() => inputRef.current?.click()}
        style={{ padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
      >
        上传插件文件夹
      </button>
        <div>
            <Link to="/">返回首页</Link>
        </div>
    </div>
  );
};

export default UploadFolder;