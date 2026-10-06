import { ChatError, chatLimits } from '../../src/domain/chat';

export type UserQuota = { day: string; count: number; minute: number; minuteCount: number; lease: string | null; leaseUntil: number };
export type GlobalQuota = { day: string; count: number };
export function reserveQuota(user: UserQuota | null, global: GlobalQuota | null, now: number, requestId: string, globalLimit: number) {
  if (!Number.isInteger(globalLimit) || globalLimit < 1 || globalLimit > 10000) throw new ChatError('DISABLED');
  const day = new Date(now).toISOString().slice(0, 10), minute = Math.floor(now / 60000);
  // A lease remains valid across midnight, even though the daily counter resets.
  if (user?.lease && user.leaseUntil > now) throw new ChatError('BUSY');
  const count = user?.day === day ? user.count : 0;
  const minuteCount = user?.minute === minute ? user.minuteCount : 0;
  const total = global?.day === day ? global.count : 0;
  if (count >= chatLimits.daily) throw new ChatError('LIMIT');
  if (minuteCount >= chatLimits.perMinute) throw new ChatError('RATE');
  if (total >= globalLimit) throw new ChatError('GLOBAL');
  return { user: { day, count: count + 1, minute, minuteCount: minuteCount + 1, lease: requestId, leaseUntil: now + 120000 },
    global: { day, count: total + 1 }, remaining: chatLimits.daily - count - 1 };
}

