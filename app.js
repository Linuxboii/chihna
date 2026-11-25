import { payload, matrix, toSVG, isUpiId } from './lib.js';
import { $, download } from './ui.js';

// [key, label, input type, placeholder or options, hint]
const FORMS = {
  url: [['url', 'Link', 'url', 'https://example.org']],
  text: [['text', 'Text', 'textarea', 'Anything up to about 1,000 characters']],
  wifi: [
    ['ssid', 'Network name', 'text', 'HomeWiFi'],
    ['password', 'Password', 'text', ''],
    ['security', 'Security', 'select', [['WPA', 'WPA or WPA2 or WPA3'], ['WEP', 'WEP'], ['nopass', 'Open, no password']]],
    ['hidden', 'Hidden network', 'checkbox'],
  ],
  upi: [
    ['vpa', 'UPI ID', 'text', 'yourname@okbank'],
    ['name', 'Payee name', 'text', 'Shop or person name'],
    ['amount', 'Amount in rupees', 'number', 'Leave empty to let the payer type it'],
    ['note', 'Note', 'text', 'Optional'],
  ],
  vcard: [
    ['name', 'Full name', 'text', ''],
    ['phone', 'Phone', 'tel', '+91 98xxx xxxxx'],
    ['email', 'Email', 'email', ''],
    ['org', 'Company', 'text', ''],
    ['title', 'Job title', 'text', ''],
    ['website', 'Website', 'url', ''],
  ],
  email: [['to', 'To', 'email', ''], ['subject', 'Subject', 'text', ''], ['body', 'Message', 'textarea', '']],
  sms: [['phone', 'Phone number', 'tel', ''], ['message', 'Message', 'textarea', '']],
};

let svg = '';
let mat = null;

function buildForm() {
  const box = $('#fields');
  box.replaceChildren();
  for (const [key, label, type, extra] of FORMS[$('#type').value]) {
    let input;
    if (type === 'select') {
      input = document.createElement('select');
      for (const [v, t] of extra) input.append(new Option(t, v));
    } else if (type === 'textarea') {
      input = document.createElement('textarea');
      input.style.minHeight = '100px';
      input.placeholder = extra || '';
    } else {
      input = document.createElement('input');
      input.type = type;
      if (type !== 'checkbox') input.placeholder = extra || '';
    }
    input.dataset.key = key;
    const l = document.createElement('label');
    if (type === 'checkbox') {
      l.className = 'row small';
      l.append(input, ' ' + label);
    } else {
      l.className = 'field';
      l.append(label, input);
    }
    box.append(l);
  }
  render();
}

function read() {
  const d = {};
  for (const el of document.querySelectorAll('#fields [data-key]')) d[el.dataset.key] = el.type === 'checkbox' ? el.checked : el.value;
  return d;
}

function validate(type, d) {
  if (type === 'upi' && d.vpa && !isUpiId(d.vpa)) return 'That UPI ID does not look right. It should look like name@bank.';
  return null;
}

function render() {
  const type = $('#type').value;
  const d = read();
  const err = $('#err');
  const problem = validate(type, d);
  const required = { url: 'url', text: 'text', wifi: 'ssid', upi: 'vpa', vcard: 'name', email: 'to', sms: 'phone' }[type];
  const off = () => { $('#png').disabled = $('#svg').disabled = true; $('#raw').textContent = ''; mat = null; };
  if (problem) { err.textContent = problem; off(); return; }
  if (!String(d[required] || '').trim()) {
    err.textContent = '';
    $('#qr').innerHTML = '<p class="empty">Fill in the form to see your code.</p>';
    off();
    return;
  }
  const text = payload(type, d);
  try {
    mat = matrix(text, $('#ecl').value);
  } catch {
    err.textContent = 'Too much content for one QR code. Shorten it or lower the error correction.';
    off();
    return;
  }
  err.textContent = '';
  svg = toSVG(mat, { fg: $('#fg').value, bg: $('#bg').value });
  $('#qr').innerHTML = svg;
  $('#qr svg').setAttribute('role', 'img');
  $('#qr svg').setAttribute('aria-label', 'QR code preview');
  $('#raw').textContent = text;
  $('#png').disabled = $('#svg').disabled = false;
  const lum = (h) => parseInt(h.slice(1, 3), 16) * 0.3 + parseInt(h.slice(3, 5), 16) * 0.59 + parseInt(h.slice(5, 7), 16) * 0.11;
  if (lum($('#fg').value) > lum($('#bg').value) - 90) err.textContent = 'Low contrast between dots and background. Many phone cameras will fail to scan this.';
}

function png() {
  const px = Math.min(4096, Math.max(128, +$('#px').value || 1024));
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas');
    c.width = c.height = px;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, px, px);
    c.toBlob((b) => download(b, `qr-${$('#type').value}.png`), 'image/png');
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

$('#type').addEventListener('change', buildForm);
$('#fields').addEventListener('input', render);
for (const id of ['fg', 'bg', 'ecl']) $('#' + id).addEventListener('input', render);
$('#svg').onclick = () => download(svg, `qr-${$('#type').value}.svg`, 'image/svg+xml');
$('#png').onclick = png;
buildForm();
