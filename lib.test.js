import { test } from 'node:test';
import assert from 'node:assert/strict';
import { payload, matrix, toSVG, escWifi, isUpiId } from './lib.js';

test('wifi payload escapes special characters', () => {
  assert.equal(escWifi('a;b,c:d\\e"f'), 'a\\;b\\,c\\:d\\\\e\\"f');
  assert.equal(payload('wifi', { ssid: 'Home;Net', password: 'p@ss', security: 'WPA', hidden: false }), 'WIFI:T:WPA;S:Home\\;Net;P:p@ss;H:false;;');
  assert.equal(payload('wifi', { ssid: 'Cafe', security: 'nopass' }), 'WIFI:T:nopass;S:Cafe;;');
});

test('upi payload is a valid deep link', () => {
  const p = payload('upi', { vpa: 'shop@okaxis', name: 'Chai Point', amount: '120.5', note: 'Order 42' });
  assert.equal(p, 'upi://pay?pa=shop%40okaxis&pn=Chai%20Point&am=120.50&cu=INR&tn=Order%2042');
  assert.equal(payload('upi', { vpa: 'a@b' }), 'upi://pay?pa=a%40b&cu=INR');
});

test('isUpiId validates the handle shape', () => {
  assert.equal(isUpiId('name.surname@okhdfcbank'), true);
  assert.equal(isUpiId('nope'), false);
});

test('vcard payload has required fields', () => {
  const v = payload('vcard', { name: 'Asha Rao', phone: '+91 98450 12345', email: 'asha@example.org', org: 'Rao & Co' });
  assert.match(v, /^BEGIN:VCARD\r\nVERSION:3\.0\r\n/);
  assert.match(v, /FN:Asha Rao/);
  assert.match(v, /N:Rao;Asha;;;/);
  assert.match(v, /TEL;TYPE=CELL:\+91 98450 12345/);
  assert.match(v, /END:VCARD$/);
});

test('url payload adds a scheme when missing', () => {
  assert.equal(payload('url', { url: 'example.org/menu' }), 'https://example.org/menu');
  assert.equal(payload('url', { url: 'http://x.io' }), 'http://x.io');
});

test('matrix produces a square boolean grid', () => {
  const m = matrix('hello', 'M');
  assert.ok(m.length >= 21);
  assert.equal(m[0].length, m.length);
  assert.equal(m[0][0], true); // finder pattern corner is dark
});

test('toSVG is valid markup with one path', () => {
  const svg = toSVG(matrix('hi', 'L'), { fg: '#000', bg: '#fff', margin: 4 });
  assert.match(svg, /^<svg[^>]+viewBox="0 0 \d+ \d+"/);
  assert.equal((svg.match(/<path/g) || []).length, 1);
});
