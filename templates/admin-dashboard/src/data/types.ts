/** The shape of the data the pages show. Change these to match your backend. */

export type Range = '7d' | '30d' | '90d';

export interface Stat {
  id: string;
  label: string;
  value: number;
  /** How the value is shown. */
  format: 'money' | 'number' | 'percent';
  /** Change from the previous period, e.g. 0.12 for +12%. */
  change: number;
  /** Whether a rise is good news (revenue) or bad news (refunds). */
  higherIsBetter: boolean;
}

export interface Channel {
  name: string;
  /** Share of sales, 0 to 1. */
  share: number;
}

export type OrderStatus = 'paid' | 'pending' | 'refunded' | 'failed';

export interface Order {
  id: string;
  customer: string;
  email: string;
  total: number;
  items: number;
  status: OrderStatus;
  placedAt: Date;
}

export interface Overview {
  stats: Stat[];
  channels: Channel[];
  recentOrders: Order[];
}

export interface Profile {
  name: string;
  email: string;
  timezone: string;
  bio: string;
}

export interface NotificationSettings {
  weeklySummary: boolean;
  newOrders: boolean;
  productUpdates: boolean;
}
