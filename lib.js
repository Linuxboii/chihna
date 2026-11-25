// QR payload builders and rendering. Pure, no DOM.
import qrcode from './vendor/qrcode.mjs';

qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];

export const escWifi = (s) => String(s).replace(/([\\;,:"])/g, '\\$1');
export const isUpiId = (s) => /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z0-9.\-]{1,63}$/.test(String(s).trim());
const vEsc = (s) => String(s).replace(/([\\;,])/g, '\\$1').replace(/\n/g, '\\n');

export function payload(type, d) {
  switch (type) {
    case 'url': {
      const u = String(d.url || '').trim();
      return /^[a-z][a-z0-9+.-]*:/i.test(u) ? u : u ? 'https://' + u : '';
    }
    case 'text':
      return String(d.text || '');
    case 'wifi': {
      const sec = d.security || 'WPA';
      let s = `WIFI:T:${sec};S:${escWifi(d.ssid || '')};`;
      if (sec !== 'nopass') s += `P:${escWifi(d.password || '')};`;
      if (sec !== 'nopass' || d.hidden) s += `H:${d.hidden ? 'true' : 'false'};`;
      return s + ';';
    }
    case 'upi': {
      const p = [['pa', String(d.vpa || '').trim()]];
      if (d.name) p.push(['pn', d.name]);
      const amt = parseFloat(d.amount);
      if (amt > 0) p.push(['am', amt.toFixed(2)]);
      p.push(['cu', 'INR']);
      if (d.note) p.push(['tn', d.note]);
      return 'upi://pay?' + p.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
    }
    case 'vcard': {
      const name = String(d.name || '').trim();
      const parts = name.split(/\s+/);
      const last = parts.length > 1 ? parts.pop() : '';
      const lines = ['BEGIN:VCARD', 'VERSION:3.0', `N:${vEsc(last)};${vEsc(parts.join(' '))};;;`, `FN:${vEsc(name)}`];
      if (d.org) lines.push(`ORG:${vEsc(d.org)}`);
      if (d.title) lines.push(`TITLE:${vEsc(d.title)}`);
      if (d.phone) lines.push(`TEL;TYPE=CELL:${d.phone}`);
      if (d.email) lines.push(`EMAIL:${d.email}`);
      if (d.website) lines.push(`URL:${d.website}`);
      lines.push('END:VCARD');
      return lines.join('\r\n');
    }
    case 'email': {
      const q = [];
      if (d.subject) q.push('subject=' + encodeURIComponent(d.subject));
      if (d.body) q.push('body=' + encodeURIComponent(d.body));
      return `mailto:${String(d.to || '').trim()}${q.length ? '?' + q.join('&') : ''}`;
    }
    case 'sms':
      return `SMSTO:${String(d.phone || '').replace(/\s/g, '')}:${d.message || ''}`;
    default:
      throw new Error('Unknown type');
  }
}

/** Boolean module grid. Picks the smallest version that fits. */
export function matrix(text, ecl = 'M') {
  const q = qrcode(0, ecl);
  q.addData(text, 'Byte');
  q.make();
  const n = q.getModuleCount();
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => q.isDark(r, c)));
}

export function toSVG(m, { fg = '#000000', bg = '#ffffff', margin = 4 } = {}) {
  const n = m.length, size = n + margin * 2;
  let d = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!m[r][c]) continue;
      let w = 1;
      while (c + w < n && m[r][c + w]) w++;
      d += `M${c + margin} ${r + margin}h${w}v1h-${w}z`;
      c += w - 1;
    }
  }
  const bgRect = bg === 'transparent' ? '' : `<rect width="100%" height="100%" fill="${bg}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">${bgRect}<path fill="${fg}" d="${d}"/></svg>`;
}
