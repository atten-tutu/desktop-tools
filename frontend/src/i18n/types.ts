import zhCNMessages from './locales/zh-CN.json';

type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: TObj[TKey] extends object
    ? `${TKey}` | `${TKey}.${RecursiveKeyOf<TObj[TKey]>}`
    : `${TKey}`;
}[keyof TObj & (string | number)];

// 添加时区键类型
type TimezoneKey = `timestamp.timezones.${string}`;

// 扩展翻译键类型以包含动态时区键
export type TranslationKeys = RecursiveKeyOf<typeof zhCNMessages> | TimezoneKey;
export type SystemLanguage = 'system';
export type AvailableLanguage = 'en-US' | 'zh-CN';
export type Language = AvailableLanguage | SystemLanguage; 