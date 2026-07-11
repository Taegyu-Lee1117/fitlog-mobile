const test = require('node:test');
const assert = require('node:assert/strict');

async function domain() { return import('../src/domain.js'); }

test('식단 기록을 만들고 공백을 제거한다', async () => {
  const { createEntry } = await domain();
  const item = createEntry('meal', { name: '  샐러드  ', amount: '420' }, new Date('2026-07-11T01:00:00Z'));
  assert.equal(item.name, '샐러드'); assert.equal(item.amount, 420); assert.equal(item.type, 'meal');
});

test('잘못된 수량은 거부한다', async () => {
  const { createEntry } = await domain();
  assert.throws(() => createEntry('workout', { name: '걷기', amount: 0 }), /0보다 큰/);
});

test('선택한 날짜의 기록만 합산한다', async () => {
  const { summarize } = await domain();
  const entries = [
    { type: 'meal', amount: 500, createdAt: '2026-07-11T03:00:00Z' },
    { type: 'workout', amount: 30, createdAt: '2026-07-11T04:00:00Z' },
    { type: 'meal', amount: 900, createdAt: '2026-07-10T03:00:00Z' },
  ];
  assert.deepEqual(summarize(entries, new Date('2026-07-11T12:00:00Z')), { calories: 500, exerciseMinutes: 30 });
});

test('진행률은 0에서 1 사이로 제한한다', async () => {
  const { progress } = await domain();
  assert.equal(progress(50, 100), 0.5); assert.equal(progress(200, 100), 1); assert.equal(progress(-1, 100), 0);
});
