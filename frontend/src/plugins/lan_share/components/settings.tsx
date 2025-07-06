import React, { useState, useRef, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Message, Checkbox, List, Spin, Space, Typography, Card } from '@arco-design/web-react';
import { IconFolder, IconScan, IconDesktop, IconWifi } from '@arco-design/web-react/icon';
import { useLanShare } from '../context/LanShareContext';
import { lanShareIpc } from '../api/ipc-interface';
import type { DeviceInfo } from '../api';
import '../styles/settings.css';

const FormItem = Form.Item;
const { Title, Text } = Typography;

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
  const { 
    hostname, 
    port, 
    setPort, 
    savePath, 
    setSavePath, 
    setHostname, 
    scanDevices, 
    availableDevices, 
    selectedDevices,
    selectDevice,
    selectAllDevices
  } = useLanShare();
  
  const [form] = Form.useForm();
  const [defaultDownloadPath, setDefaultDownloadPath] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const internalRef = useRef<{ submit: () => void }>({
    submit: () => form.submit()
  });
  
  // 获取默认下载路径
  useEffect(() => {
    const getDefaultDownloadPath = async () => {
      try {
        const path = await lanShareIpc.getDownloadsPath();
        setDefaultDownloadPath(path);
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

  React.useImperativeHandle(formRef, () => internalRef.current);
  
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
    setHostname(values.hostname);
    
    setPort(values.port);
    
    setSavePath(values.savePath || defaultDownloadPath);
    
    try {
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // 处理扫描设备
  const handleScanDevices = async () => {
    setIsScanning(true);
    try {
      await scanDevices();
      Message.success('设备扫描完成');
    } catch (error) {
      console.error('Failed to scan devices:', error);
      Message.error('设备扫描失败');
    } finally {
      setIsScanning(false);
    }
  };

  // 处理设备选择
  const handleDeviceSelect = (device: DeviceInfo, checked: boolean) => {
    selectDevice(device.id, checked);
  };

  // 处理全选/全不选
  const handleSelectAll = (checked: boolean) => {
    selectAllDevices(checked);
  };

  // 检查设备是否被选中
  const isDeviceSelected = (deviceId: string) => {
    return selectedDevices.some(device => device.id === deviceId);
  };

  // 全选状态
  const allSelected = availableDevices.length > 0 && 
    availableDevices.length === selectedDevices.length;
  
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

        <FormItem
          label="设备扫描"
          tooltip="扫描局域网中的其他设备"
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button 
              type="primary" 
              onClick={handleScanDevices} 
              loading={isScanning}
              style={{ marginBottom: 16 }}
            >
              扫描设备
            </Button>
            
            <Card className="devices-card">
              <div className="devices-header">
                <Checkbox 
                  checked={allSelected}
                  onChange={handleSelectAll}
                  disabled={availableDevices.length === 0}
                >
                  全选
                </Checkbox>
              </div>
              
              {isScanning ? (
                <div className="devices-loading">
                  <Spin tip="正在扫描设备..." />
                </div>
              ) : availableDevices.length > 0 ? (
                <List
                  className="devices-list"
                  dataSource={availableDevices}
                  render={(item, index) => (
                    <List.Item
                      key={item.id}
                      className="device-item"
                      actions={[
                        <Checkbox
                          key="select"
                          checked={isDeviceSelected(item.id)}
                          onChange={(checked) => handleDeviceSelect(item, checked)}
                        />
                      ]}
                    >
                      <div className="device-info">
                        <IconDesktop className="device-icon" />
                        <div className="device-details">
                          <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
                          <Text type="secondary">{item.ip}</Text>
                        </div>
                        {item.isOnline && (
                          <IconWifi className="device-status-icon online" />
                        )}
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <div className="devices-empty">
                  <Text type="secondary">暂无可用设备，请点击扫描按钮</Text>
                </div>
              )}
            </Card>
          </Space>
        </FormItem>
      </Form>
    </div>
  );
};

export default Settings; 