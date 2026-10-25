import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Exercise the real transport with isolated dependencies; never call a deployed API.
const source = (await readFile(new URL('../src/lib/api/notificationService.js', import.meta.url), 'utf8'))
  .replace(/^import .*;\r?\n/gm, '');
const dependencies = `
const API_BASE_URL = 'https://notifications.test';
const TokenManager = { getToken: () => 'test-session' };
const API_ENDPOINTS = { NOTIFICATIONS: {
  BROADCAST: '/api/admin/notifications/broadcasts',
  SEND: id => '/api/admin/riders/' + id + '/notifications',
  STATUS: id => '/api/admin/notifications/' + id,
} };
`;
const { normalizeNotificationPayload: normalize, NotificationService: service } = await import(`data:text/javascript;base64,${Buffer.from(dependencies + source).toString('base64')}`);
const draft = () => ({ content: { en: { title: ' Monthly report ', body: ' Open your report. ' } }, data: { type: 'home' }, expiresInSeconds: 86400 });

test('trims content and omits unused translations', () => {
  assert.deepEqual(normalize(draft()), { content: { en: { title: 'Monthly report', body: 'Open your report.' } }, data: { type: 'home' }, expiresInSeconds: 86400 });
});

test('requires paired fields and enforces content limits', () => {
  for (const content of [{ en: { title: ' ', body: 'Hello' } }, { en: { title: 'a'.repeat(121), body: 'Hello' } }, { en: { title: 'Hi', body: 'a'.repeat(501) } }, { ...draft().content, ar: { title: 'مرحبًا' } }, { ...draft().content, bn: { body: 'বার্তা' } }]) {
    assert.throws(() => normalize({ ...draft(), content }));
  }
});

test('rejects fractional, out-of-range and malformed delivery windows', () => {
  for (const expiresInSeconds of [59, 604801, 60.5, '3600seconds', NaN]) assert.throws(() => normalize({ ...draft(), expiresInSeconds }));
  for (const expiresInSeconds of [60, 86400, 604800]) assert.equal(normalize({ ...draft(), expiresInSeconds }).expiresInSeconds, expiresInSeconds);
});

test('validates report strings, month bounds and Saudi future periods', () => {
  for (const data of [{ type: 'performance_report', year: '2026oops', month: '1' }, { type: 'performance_report', year: '2020', month: '1.5' }, { type: 'performance_report', year: '2020', month: '13' }, { type: 'performance_report', year: '2999', month: '1' }, { type: 'url' }]) assert.throws(() => normalize({ ...draft(), data }));
  assert.deepEqual(normalize({ ...draft(), data: { type: 'performance_report', year: '2020', month: '02' } }).data, { type: 'performance_report', year: '2020', month: '2' });
});

test('transport retry reuses the original key, immutable body and target', async () => {
  const originalFetch = globalThis.fetch;
  const command = service.prepareCommand(42, draft());
  const requests = [];
  globalThis.fetch = async (url, init) => {
    requests.push({ url, body: init.body, key: init.headers['Idempotency-Key'] });
    if (requests.length === 1) throw new TypeError('Offline');
    return new Response(JSON.stringify({ requestId: '9f30744b-28fe-4901-9060-c138bf5b5919', status: 'queued' }), { status: 202 });
  };
  try {
    await assert.rejects(service.submitCommand(command), (error) => error.isNetworkError);
    await service.submitCommand(command);
    assert.deepEqual(requests[0], requests[1]);
    assert.equal(requests[0].url, 'https://notifications.test/api/admin/riders/42/notifications');
  } finally { globalThis.fetch = originalFetch; }
});

test('broadcast and rider commands remain distinct, invalid targets never become broadcasts', () => {
  assert.equal(service.prepareCommand(null, draft()).riderId, null);
  assert.equal(service.prepareCommand('42', draft()).riderId, 42);
  for (const target of ['', 0, -1, 'not-a-rider', 1.2]) assert.throws(() => service.prepareCommand(target, draft()));
});

test('malformed accepted response remains an uncertain send', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('{}', { status: 202 });
  try { await assert.rejects(service.submitCommand(service.prepareCommand(null, draft())), (error) => error.isNetworkError); }
  finally { globalThis.fetch = originalFetch; }
});

test('response-body transport failures remain uncertain and can reuse the command', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ text: async () => { throw new TypeError('Connection lost while reading'); } });
  try { await assert.rejects(service.submitCommand(service.prepareCommand(null, draft())), (error) => error.isNetworkError); }
  finally { globalThis.fetch = originalFetch; }
});

test('preserves HTTP status and Retry-After for permission and cooldown UI', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('', { status: 429, headers: { 'Retry-After': '60' } });
  try { await assert.rejects(service.getStatus('request'), (error) => error.status === 429 && error.retryAfter === '60'); }
  finally { globalThis.fetch = originalFetch; }
});

test('UTC dates without a suffix match explicit UTC and invalid dates stay readable', () => {
  assert.equal(service.formatUtcTimestamp('2026-10-23T12:00:00', 'en'), service.formatUtcTimestamp('2026-10-23T12:00:00Z', 'en'));
  assert.equal(service.formatUtcTimestamp('invalid'), '—');
});
