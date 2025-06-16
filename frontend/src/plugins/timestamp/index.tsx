import React, { useState, useEffect, useMemo } from 'react';
import { Radio, Select, Input, Space, Tooltip } from '@arco-design/web-react';
import { DateTime } from 'luxon';
import { IconCopy, IconLeft, IconPlayArrow, IconPause } from '@arco-design/web-react/icon';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';
import './style.css';
import { useTranslation } from '../i18n/i18n';
import { Link } from '@tanstack/react-router';

const RadioGroup = Radio.Group;
const Option = Select.Option;

const TimestampConverter: React.FC = () => {
  const { t } = useTranslation();
  const [timestampUnit, setTimestampUnit] = useState<'second' | 'millisecond'>('second');
  const [selectedZone, setSelectedZone] = useState(DateTime.local().zoneName);
  const [inputDateTime, setInputDateTime] = useState('');
  const [inputTimestamp, setInputTimestamp] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [displayTime, setDisplayTime] = useState('');
  const [displayTimestamp, setDisplayTimestamp] = useState('');
  const [showCopiedTip, setShowCopiedTip] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [pausedDateTime, setPausedDateTime] = useState<DateTime | null>(null);

  const zones = useMemo(() => {
    const allZones = Intl.supportedValuesOf('timeZone');
    // 过滤时区
    return allZones
      .filter(zone => {
        const key = `timestamp.timezones.${zone}` as const;
        try {
          return t(key) !== key;
        } catch {
          return false;
        }
      })
      .sort((a, b) => {
        const keyA = `timestamp.timezones.${a}` as const;
        const keyB = `timestamp.timezones.${b}` as const;
        const nameA = t(keyA);
        const nameB = t(keyB);

        const [utcA = ''] = nameA.split('|');
        const [utcB = ''] = nameB.split('|');
        return utcA.trim().localeCompare(utcB.trim());
      });
  }, [t]);

  // 复制
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setShowCopiedTip(id);
      setTimeout(() => setShowCopiedTip(''), 1000);
    });
  };

  // 初始化
  useEffect(() => {
    const today = DateTime.now().setZone(selectedZone).startOf('day');
    setInputDateTime(today.toFormat('yyyy-MM-dd\'T\'HH:mm'));

    const timestamp = timestampUnit === 'second' 
      ? Math.floor(today.toSeconds())
      : today.toMillis();
    setInputTimestamp(timestamp.toString());
  }, [selectedZone, timestampUnit]);

  const handleDateTimeChange = (value: string) => {
    setInputDateTime(value);
    if (value) {
      const dt = DateTime.fromISO(value, { zone: selectedZone });
      if (dt.isValid) {
        const timestamp = timestampUnit === 'second' 
          ? Math.floor(dt.toSeconds())
          : dt.toMillis();
        setInputTimestamp(timestamp.toString());
      }
    } else {
      setInputTimestamp('');
    }
  };

  const handleTimestampChange = (value: string) => {
    setInputTimestamp(value);
    if (value) {
      const timestamp = parseInt(value);
      if (!isNaN(timestamp)) {
        const dt = timestampUnit === 'second'
          ? DateTime.fromSeconds(timestamp, { zone: selectedZone })
          : DateTime.fromMillis(timestamp, { zone: selectedZone });
        if (dt.isValid) {
          setInputDateTime(dt.toFormat('yyyy-MM-dd\'T\'HH:mm'));
        }
      }
    } else {
      setInputDateTime('');
    }
  };

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(new Date());
    };

    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateDisplay = () => {
      if (isPaused && pausedDateTime) {
        setDisplayTime(pausedDateTime.toFormat('yyyy-MM-dd HH:mm:ss'));
        setDisplayTimestamp(
          timestampUnit === 'second'
            ? Math.floor(pausedDateTime.toSeconds()).toString()
            : pausedDateTime.toMillis().toString()
        );
      } else {
        const now = DateTime.now().setZone(selectedZone);
        setDisplayTime(now.toFormat('yyyy-MM-dd HH:mm:ss'));
        setDisplayTimestamp(
          timestampUnit === 'second'
            ? Math.floor(now.toSeconds()).toString()
            : now.toMillis().toString()
        );
      }
    };

    updateDisplay();
    const timer = setInterval(updateDisplay, 1000);
    return () => clearInterval(timer);
  }, [selectedZone, timestampUnit, isPaused, pausedDateTime]);

  const handlePlayPauseClick = () => {
    if (isPaused) {
      setIsPaused(false);
      setPausedDateTime(null);
    } else {
      // 暂停当前时间
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
              <Radio value="second">{t('timestamp.second')}</Radio>
              <Radio value="millisecond">{t('timestamp.millisecond')}</Radio>
            </RadioGroup>

            <Select
              placeholder={t('timestamp.select_timezone')}
              value={selectedZone}
              onChange={setSelectedZone}
              style={{ width: '240px', marginLeft: '16px' }}
            >
              {zones.map(zone => {
                const key = `timestamp.timezones.${zone}` as const;
                return (
                  <Option key={zone} value={zone}>
                    {t(key)}
                  </Option>
                );
              })}
            </Select>
          </div>

          <div className="converter-section">
            <h3>{t('timestamp.datetime_to_timestamp')}</h3>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input
                type="datetime-local"
                value={inputDateTime}
                onChange={handleDateTimeChange}
              />
              {inputTimestamp && (
                <Tooltip content={t('timestamp.copied')} position="bottom" popupVisible={showCopiedTip === 'timestamp1'}>
                  <div className="result" onClick={() => copyToClipboard(inputTimestamp, 'timestamp1')}>
                    {inputTimestamp}
                    <IconCopy />
                  </div>
                </Tooltip>
              )}
            </Space>
          </div>

          <div className="converter-section">
            <h3>{t('timestamp.timestamp_to_datetime')}</h3>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input
                value={inputTimestamp}
                onChange={handleTimestampChange}
                placeholder={t('timestamp.enter_timestamp')}
              />
              {inputDateTime && (
                <Tooltip content={t('timestamp.copied')} position="bottom" popupVisible={showCopiedTip === 'timestamp2'}>
                  <div className="result" onClick={() => copyToClipboard(inputDateTime, 'timestamp2')}>
                    {DateTime.fromISO(inputDateTime, { zone: selectedZone }).toFormat('yyyy-MM-dd HH:mm:ss')}
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
            <Tooltip content={t('timestamp.copied')} position="bottom" popupVisible={showCopiedTip === 'current1'}>
              <div className="result" onClick={() => copyToClipboard(displayTime, 'current1')}>
                {displayTime}
                <IconCopy />
              </div>
            </Tooltip>
            <Tooltip content={t('timestamp.copied')} position="bottom" popupVisible={showCopiedTip === 'current2'}>
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

// 时间戳转换页面
const TimestampPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="timestamp-page">
      <TimestampConverter />
      <Link to="/" className="arco-link back-link">
        <IconLeft /> {t('back_to_home')}
      </Link>
    </div>
  );
};

export { TimestampConverter };
export default TimestampPage; 