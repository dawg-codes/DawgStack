import { appConfig } from './app.config';

const money = new Intl.NumberFormat(appConfig.locale, {
  style: 'currency',
  currency: appConfig.currency,
});
const compactMoney = new Intl.NumberFormat(appConfig.locale, {
  style: 'currency',
  currency: appConfig.currency,
  notation: 'compact',
  maximumFractionDigits: 1,
});
const number = new Intl.NumberFormat(appConfig.locale);
const percent = new Intl.NumberFormat(appConfig.locale, {
  style: 'percent',
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
});
const date = new Intl.DateTimeFormat(appConfig.locale, { dateStyle: 'medium' });

export const formatMoney = (value: number) => money.format(value);
export const formatCompactMoney = (value: number) => compactMoney.format(value);
export const formatNumber = (value: number) => number.format(value);
/** A change such as 0.125 as "+12.5%". */
export const formatChange = (value: number) => percent.format(value);
export const formatDate = (value: Date) => date.format(value);
