import React, { useState, useRef, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Message, Checkbox, List, Spin, Space, Typography, Card } from '@arco-design/web-react';
import { IconFolder, IconScan, IconDesktop, IconWifi } from '@arco-design/web-react/icon';
import { useLanShare } from '../context/LanShareContext';
import { lanShareIpc } from '../api/ipc-interface';
import type { DeviceInfo } from '../api';
import '../styles/settings.css';
import { useTranslation } from '../../../i18n/i18n';

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
  const { t } = useTranslation();
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
      Message.error(t('select_folder_failed'));
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
      Message.success(t('scan_devices_success'));
    } catch (error) {
      console.error('Failed to scan devices:', error);
      Message.error(t('scan_devices_failed'));
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
          label={t('device_name')}
          field="hostname"
          tooltip={t('device_name_tooltip')}
          rules={[{ required: true, message: t('device_name_required') }]}
        >
          <Input
            placeholder={t('device_name_placeholder')}
            allowClear 
            onClear={() => handleClear('hostname')}
          />
        </FormItem>
        
        <FormItem
          label={t('port')}
          field="port"
          tooltip={t('port_tooltip')}
          rules={[
            { required: true, message: t('port_required') },
            {
              validator: (value, callback) => {
                if (value < 1024 || value > 65535) {
                  callback(t('port_range_invalid'));
                }
                callback();
              }
            }
          ]}
        >
          <InputNumber 
            min={1024} 
            max={65535} 
            placeholder={t('port_placeholder')}
          />
        </FormItem>
        
        <FormItem
          label={t('save_path')}
          field="savePath"
          tooltip={t('save_path_tooltip')}
          rules={[{ required: true, message: t('save_path_required') }]}
        >
          <Input
            placeholder={t('save_path_placeholder')}
            readOnly
            allowClear
            onClear={() => handleClear('savePath')}
            addAfter={
              <Button icon={<IconFolder />} onClick={handleSelectPath} />
            }
          />
        </FormItem>

        <FormItem
          label={t('scan_devices')}
          tooltip={t('scan_devices_tooltip')}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button 
              type="primary" 
              onClick={handleScanDevices} 
              loading={isScanning}
              style={{ marginBottom: 16 }}
            >
              {t('scan_devices')}
            </Button>
            
            <Card className="devices-card">
              <div className="devices-header">
                <Checkbox 
                  checked={allSelected}
                  onChange={handleSelectAll}
                  disabled={availableDevices.length === 0}
                >
                  {t('select_all')}
                </Checkbox>
              </div>
              
              {isScanning ? (
                <div className="devices-loading">
                  <Spin tip={t('scanning_devices')} />
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
                  <Text type="secondary">{t('no_devices')}</Text>
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