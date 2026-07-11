export const DEFAULT_GOALS = Object.freeze({ calories: 2000, exerciseMinutes: 45 });

export function createEntry(type, values, now = new Date()) {
  if (!['meal', 'workout'].includes(type)) throw new Error('지원하지 않는 기록 유형입니다.');
  const name = String(values.name ?? '').trim();
  const amount = Number(values.amount);
  if (!name) throw new Error('이름을 입력해 주세요.');
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('0보다 큰 숫자를 입력해 주세요.');
  return {
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    name,
    amount: Math.round(amount),
    createdAt: now.toISOString(),
  };
}

export function isSameLocalDay(iso, date = new Date()) {
  const target = new Date(iso);
  return target.getFullYear() === date.getFullYear()
    && target.getMonth() === date.getMonth()
    && target.getDate() === date.getDate();
}

export function summarize(entries, date = new Date()) {
  return entries.filter((entry) => isSameLocalDay(entry.createdAt, date)).reduce(
    (summary, entry) => {
      if (entry.type === 'meal') summary.calories += entry.amount;
      if (entry.type === 'workout') summary.exerciseMinutes += entry.amount;
      return summary;
    },
    { calories: 0, exerciseMinutes: 0 },
  );
}

export function progress(value, goal) {
  if (!Number.isFinite(goal) || goal <= 0) return 0;
  return Math.min(1, Math.max(0, value / goal));
}
