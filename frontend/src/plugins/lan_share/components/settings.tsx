import React, { useState, useRef, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Message } from '@arco-design/web-react';
import { IconFolder } from '@arco-design/web-react/icon';
import { useLanShare } from '../context/LanShareContext';
import { lanShareIpc } from '../api/ipc-interface';
import '../styles/settings.css';

const FormItem = Form.Item;

interface FormValues {
  hostname: string;
  port: number;
  savePath: string;
}

interface SettingsProps {
  formRef?: React.RefObject<{
    submit: () => void;
  } | null>;
}

const Settings: React.FC<SettingsProps> = ({ formRef }) => {
  const { hostname, port, setPort, savePath, setSavePath, setHostname } = useLanShare();
  const [form] = Form.useForm();
  const [defaultDownloadPath, setDefaultDownloadPath] = useState('');
  const internalRef = useRef<{ submit: () => void }>({
    submit: () => form.submit()
  });
  
  // 获取默认下载路径
  useEffect(() => {
    const getDefaultDownloadPath = async () => {
      try {
        const path = await lanShareIpc.getDownloadsPath();
        setDefaultDownloadPath(path);
        // 如果没有设置保存路径，使用默认下载路径
        if (!savePath) {
          setSavePath(path);
          form.setFieldValue('savePath', path);
        }
      } catch (error) {
        console.error('Failed to get downloads path:', error);
      }
    };
    
    getDefaultDownloadPath();
  }, []);
  
  // 加载初始值
  useEffect(() => {
    form.setFieldsValue({
      hostname: hostname,
      port: port,
      savePath: savePath || defaultDownloadPath
    });
  }, [hostname, port, savePath, defaultDownloadPath, form]);

  // 将内部ref暴露给外部
  React.useImperativeHandle(formRef, () => internalRef.current);

  // 选择文件保存路径
  const handleSelectPath = async () => {
    try {
      const selectedPath = await lanShareIpc.selectDirectory();
      if (selectedPath) {
        setSavePath(selectedPath);
        form.setFieldValue('savePath', selectedPath);
      }
    } catch (error) {
      console.error('Failed to select directory:', error);
      Message.error('文件夹选择失败');
    }
  };

  // 处理输入框清除
  const handleClear = (field: keyof FormValues) => {
    switch (field) {
      case 'hostname':
        // 清除主机名时，重新获取系统主机名
        lanShareIpc.getHostname().then((systemHostname) => {
          setHostname(systemHostname);
          form.setFieldValue('hostname', systemHostname);
        });
        break;
      case 'port':
        // 清除端口时，设置为默认端口 3000
        setPort(3000);
        form.setFieldValue('port', 3000);
        break;
      case 'savePath':
        // 清除保存路径时，设置为默认下载路径
        setSavePath(defaultDownloadPath);
        form.setFieldValue('savePath', defaultDownloadPath);
        break;
    }
  };

  // 保存设置
  const handleSubmit = (values: FormValues) => {
    // 保存本机名称
    setHostname(values.hostname);
    
    // 保存端口号
    setPort(values.port);
    
    // 保存文件路径
    setSavePath(values.savePath || defaultDownloadPath);
    
    // 使用 notification 代替 Message
    try {
      console.log('Settings saved successfully');
      // 不使用 Message 组件，避免渲染问题
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <div className="settings-container">
      <Form 
        form={form}
        initialValues={{
          hostname: hostname,
          port: port,
          savePath: savePath || defaultDownloadPath
        }}
        onSubmit={handleSubmit}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        className="settings-form"
      >
        <FormItem 
          label="本机名称" 
          field="hostname"
          tooltip="设置自定义名称（对其他设备可见）"
          rules={[{ required: true, message: '请输入本机名称' }]}
        >
          <Input 
            placeholder="请输入本机名称" 
            allowClear 
            onClear={() => handleClear('hostname')}
          />
        </FormItem>
        
        <FormItem 
          label="端口号" 
          field="port"
          tooltip="局域网共享服务的端口号（1024-65535）"
          rules={[
            { required: true, message: '请输入端口号' },
            {
              validator: (value, callback) => {
                if (value < 1024 || value > 65535) {
                  callback('端口号必须在1024到65535之间');
                }
                callback();
              }
            }
          ]}
        >
          <InputNumber 
            min={1024} 
            max={65535} 
            placeholder="请输入端口号" 
          />
        </FormItem>
        
        <FormItem 
          label="保存路径" 
          field="savePath"
          tooltip="接收的文件将被保存在此目录"
          rules={[{ required: true, message: '请选择文件保存路径' }]}
        >
          <Input
            placeholder="请选择文件保存路径"
            readOnly
            allowClear
            onClear={() => handleClear('savePath')}
            addAfter={
              <Button icon={<IconFolder />} onClick={handleSelectPath} />
            }
          />
        </FormItem>
      </Form>
    </div>
  );
};

export default Settings; 