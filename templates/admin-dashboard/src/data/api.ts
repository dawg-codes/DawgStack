import { sampleChannels, sampleOrders, sampleStats } from './sample';
import type { NotificationSettings, Order, Overview, Profile, Range } from './types';

/**
 * Every call to your backend lives in this file. Replace each function body with a real
 * request, for example:
 *
 *   const response = await fetch(`/api/overview?range=${range}`, { signal, credentials: 'include' });
 *   if (!response.ok) throw new Error(`Request failed (${response.status})`);
 *   return (await response.json()) as Overview;
 *
 * The pages only use these functions and the types in types.ts. Until then, they return the
 * made-up data in sample.ts after a short pause, so the loading states are visible.
 */

export async function loadOverview(range: Range, signal?: AbortSignal): Promise<Overview> {
  await delay(600, signal);
  return {
    stats: sampleStats(range),
    channels: sampleChannels,
    recentOrders: orders.slice(0, 5).map(copy),
  };
}

/**
 * All orders. For large lists, page, sort and filter on your server instead: add those
 * options here and pass them through from the Orders page.
 */
export async function loadOrders(signal?: AbortSignal): Promise<Order[]> {
  await delay(500, signal);
  return orders.map(copy);
}

export async function refundOrder(id: string): Promise<Order> {
  await delay(600);
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) throw new Error('Order not found');
  orders[index] = { ...orders[index]!, status: 'refunded' };
  return copy(orders[index]);
}

export async function loadProfile(signal?: AbortSignal): Promise<Profile> {
  await delay(300, signal);
  return { ...profile };
}

export async function saveProfile(next: Profile): Promise<Profile> {
  await delay(600);
  profile = { ...next };
  return profile;
}

export async function loadNotificationSettings(
  signal?: AbortSignal,
): Promise<NotificationSettings> {
  await delay(300, signal);
  return { ...notifications };
}

export async function saveNotificationSettings(
  next: NotificationSettings,
): Promise<NotificationSettings> {
  await delay(300);
  notifications = { ...next };
  return notifications;
}

export async function deleteWorkspace(): Promise<void> {
  await delay(900);
}

// ---- Demo state (in memory; resets when the page reloads) ----
// Callers get copies, as they would from a real server.
const copy = (order: Order): Order => ({ ...order });
const orders = sampleOrders.map(copy);
let profile: Profile = {
  name: 'Ana Silva',
  email: 'ana@example.com',
  timezone: 'Europe/Lisbon',
  bio: '',
};
let notifications: NotificationSettings = {
  weeklySummary: true,
  newOrders: true,
  productUpdates: false,
};

function delay(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
}
