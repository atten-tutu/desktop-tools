import React, { useState, useEffect, useMemo } from 'react';
import { Radio, Select, Input, Space, Tooltip, DatePicker } from '@arco-design/web-react';
import { DateTime } from 'luxon';
import { IconCopy, IconPlayArrow, IconPause } from '@arco-design/web-react/icon';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';
import './styles/index.css';
import { useTimestampTranslation } from './i18n';

const RadioGroup = Radio.Group;
const Option = Select.Option;

declare global {
  interface Window {
    electron: any;
  }
}

const TimestampConverter: React.FC = () => {
  const { t } = useTimestampTranslation();
  const [timestampUnit, setTimestampUnit] = useState<'second' | 'millisecond'>('second');
  const [selectedZone, setSelectedZone] = useState<string>(DateTime.local().zoneName);
  
  // 分离两个转换方向的状态
  const [dateTimeInput, setDateTimeInput] = useState<string>('');
  const [timestampOutput, setTimestampOutput] = useState<string>('');
  const [timestampInput, setTimestampInput] = useState<string>('');
  const [dateTimeOutput, setDateTimeOutput] = useState<string>('');
  
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [displayTime, setDisplayTime] = useState<string>('');
  const [displayTimestamp, setDisplayTimestamp] = useState<string>('');
  const [showCopiedTip, setShowCopiedTip] = useState<string>('');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [pausedDateTime, setPausedDateTime] = useState<DateTime | null>(null);

  // 从electron主进程获取系统时区
  useEffect(() => {
    const initializeTimezone = async () => {
      try {
        const systemZone = await window.electron.ipcRenderer.invoke('timestamp:getSystemTimezone');
        setSelectedZone(systemZone);
      } catch (error) {
        console.error('Failed to get system timezone:', error);
        setSelectedZone(DateTime.local().zoneName);
      }
    };
    initializeTimezone();
  }, []);

  // 更新时钟
  useEffect(() => {
    if (!selectedZone) return;

    const updateClock = () => {
      const utcNow = DateTime.utc();
      const localTime = utcNow.setZone(selectedZone);
      const jsDate = new Date(localTime.toFormat('yyyy-MM-dd\'T\'HH:mm:ss.SSS'));
      setCurrentTime(jsDate);
    };

    // 立即更新一次
    updateClock();
    
    // 每秒更新一次时钟
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, [selectedZone]);

  // 更新显示时间和时间戳
  useEffect(() => {
    if (!selectedZone) return;

    const updateDisplay = () => {
      if (isPaused && pausedDateTime) {
        // 暂停状态下使用暂停时的时间，使用ISO 8601格式
        setDisplayTime(pausedDateTime.toFormat("yyyy-MM-dd'T'HH:mm:ss"));
        // 时间戳是一个绝对值，与时区无关
        const timestamp = timestampUnit === 'second'
          ? Math.floor(pausedDateTime.toUTC().toSeconds())
          : pausedDateTime.toUTC().toMillis();
        setDisplayTimestamp(timestamp.toString());
      } else {
        // 使用当前时间，并根据选定时区显示，使用ISO 8601格式
        const now = DateTime.now().setZone(selectedZone);
        setDisplayTime(now.toFormat("yyyy-MM-dd'T'HH:mm:ss"));
        
        // 时间戳是一个绝对值，与时区无关
        const timestamp = timestampUnit === 'second'
          ? Math.floor(now.toUTC().toSeconds())
          : now.toUTC().toMillis();
        setDisplayTimestamp(timestamp.toString());
      }
    };

    updateDisplay();
    const timer = setInterval(updateDisplay, 1000); // 更新频率为1秒
    return () => clearInterval(timer);
  }, [selectedZone, timestampUnit, isPaused, pausedDateTime]);

  const zones = useMemo(() => {
    const allZones = Intl.supportedValuesOf('timeZone');
    return allZones
      .filter((zone: string) => {
        try {
          return t(`timezones.${zone}`) !== `timezones.${zone}`;
        } catch {
          return false;
        }
      })
      .sort((a: string, b: string) => {
        const nameA = t(`timezones.${a}`);
        const nameB = t(`timezones.${b}`);
        const [utcA = ''] = nameA.split('|');
        const [utcB = ''] = nameB.split('|');
        return utcA.trim().localeCompare(utcB.trim());
      });
  }, [t]);

  // 复制到剪贴板
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setShowCopiedTip(id);
      setTimeout(() => setShowCopiedTip(''), 1000);
    });
  };

  // 初始化 dateTimeInput、timestampOutput 和 timestampInput、dateTimeOutput
  useEffect(() => {
    if (!selectedZone) return;
    // 获取当前选定时区的今天开始时间
    const today = DateTime.now().setZone(selectedZone).startOf('day');
    setDateTimeInput(today.toFormat("yyyy-MM-dd'T'HH:mm:ss"));
    
    // 时间戳是一个绝对值，与时区无关
    const timestamp = timestampUnit === 'second'
      ? Math.floor(today.toUTC().toSeconds())
      : today.toUTC().toMillis();
    setTimestampOutput(timestamp.toString());
    setTimestampInput(timestamp.toString());
    
    // 设置默认的时间戳转日期输出
    const dt = timestampUnit === 'second'
      ? DateTime.fromSeconds(timestamp).setZone(selectedZone)
      : DateTime.fromMillis(timestamp).setZone(selectedZone);
    setDateTimeOutput(dt.toFormat("yyyy-MM-dd'T'HH:mm:ss"));
  }, [selectedZone, timestampUnit]);

  const handleDateTimeChange = (value: string) => {
    setDateTimeInput(value);
    if (value) {
      // 从ISO格式创建DateTime对象，并指定时区
      const dt = DateTime.fromISO(value, { zone: selectedZone });
      if (dt.isValid) {
        // 计算时间戳
        const timestamp = timestampUnit === 'second'
          ? Math.floor(dt.toUTC().toSeconds())
          : dt.toUTC().toMillis();
        setTimestampOutput(timestamp.toString());
      }
    } else {
      setTimestampOutput('');
    }
  };

  const handleTimestampChange = (value: string) => {
    setTimestampInput(value);
    if (value) {
      const timestamp = parseInt(value);
      if (!isNaN(timestamp)) {
        // 时间戳是一个绝对值，与时区无关
        // 从时间戳创建UTC DateTime对象，然后转换到选定时区
        const dt = timestampUnit === 'second'
          ? DateTime.fromSeconds(timestamp).setZone(selectedZone)
          : DateTime.fromMillis(timestamp).setZone(selectedZone);
        if (dt.isValid) {
          setDateTimeOutput(dt.toFormat("yyyy-MM-dd'T'HH:mm:ss"));
        }
      }
    } else {
      setDateTimeOutput('');
    }
  };

  const handlePlayPauseClick = () => {
    if (isPaused) {
      setIsPaused(false);
      setPausedDateTime(null);
    } else {
      const now = DateTime.now().setZone(selectedZone);
      setPausedDateTime(now);
      setIsPaused(true);
    }
  };

  return (
    <div className="timestamp-converter">
      <div className="left-panel">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div className="controls">
            <RadioGroup
              type="button"
              value={timestampUnit}
              onChange={setTimestampUnit}
            >
              <Radio value="second">{t('second')}</Radio>
              <Radio value="millisecond">{t('millisecond')}</Radio>
            </RadioGroup>
            <Select
              placeholder={t('select_timezone')}
              value={selectedZone}
              onChange={setSelectedZone}
              style={{ width: '240px', marginLeft: '16px' }}
            >
              {zones.map(zone => (
                <Option key={zone} value={zone}>
                  {t(`timezones.${zone}`)}
                </Option>
              ))}
            </Select>
          </div>
          <div className="converter-section">
            <h3>{t('datetime_to_timestamp')}</h3>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input
                type="datetime-local"
                step="1" // 支持秒级精度
                value={dateTimeInput}
                onChange={handleDateTimeChange}
              />
              {timestampOutput && (
                <Tooltip content={t('copied')} position="bottom" popupVisible={showCopiedTip === 'timestamp1'}>
                  <div className="result" onClick={() => copyToClipboard(timestampOutput, 'timestamp1')}>
                    {timestampOutput}
                    <IconCopy />
                  </div>
                </Tooltip>
              )}
            </Space>
          </div>
          <div className="converter-section">
            <h3>{t('timestamp_to_datetime')}</h3>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input
                value={timestampInput}
                onChange={handleTimestampChange}
                placeholder={t('enter_timestamp')}
              />
              {dateTimeOutput && (
                <Tooltip content={t('copied')} position="bottom" popupVisible={showCopiedTip === 'timestamp2'}>
                  <div className="result" onClick={() => copyToClipboard(dateTimeOutput, 'timestamp2')}>
                    {dateTimeOutput}
                    <IconCopy />
                  </div>
                </Tooltip>
              )}
            </Space>
          </div>
        </Space>
      </div>
      <div className="right-panel">
        <div className="clock-container">
          <Clock
            value={currentTime}
            renderNumbers={true}
            size={180}
          />
          <div className="current-time-section">
            <Tooltip content={t('copied')} position="bottom" popupVisible={showCopiedTip === 'current1'}>
              <div className="result" onClick={() => copyToClipboard(displayTime, 'current1')}>
                {displayTime}
                <IconCopy />
              </div>
            </Tooltip>
            <Tooltip content={t('copied')} position="bottom" popupVisible={showCopiedTip === 'current2'}>
              <div className="result" onClick={() => copyToClipboard(displayTimestamp, 'current2')}>
                {displayTimestamp}
                <IconCopy />
              </div>
            </Tooltip>
            <div className="clock-control" onClick={handlePlayPauseClick}>
              {isPaused ? (
                <IconPlayArrow className="play-icon" />
              ) : (
                <IconPause className="pause-icon" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimestampConverter; 