# Chihna

QR codes for links, Wi-Fi, UPI and contacts.

**Live:** https://chihna.avlokai.com

**For:** Shops, restaurants, event organisers and anyone sharing Wi-Fi or a payment ID.

## What it does

- Website, Wi-Fi login, UPI payment, contact card, email, SMS and plain text
- Static codes: no redirect, no tracking, no expiry
- Custom colours with a scan-contrast warning
- Four error-correction levels
- Download as SVG for print or PNG up to 4096 px

QR encoding by qrcode-generator (Kazuhiko Arase, MIT), vendored.

## Demand

Semrush estimates qr-code-generator.com at about 7.9 million visits a month. India reports roughly 555 million people onboarded on UPI, the payment system the UPI QR mode targets.

- [Semrush: qr-code-generator.com](https://semrush.com/website/qr-code-generator.com/overview)
- [IBEF: 55.49 crore UPI users by June 2026](https://www.ibef.org/news/upi-onboarded-55-49-crore-users-by-june-2026-transactions-reach-us-3-56-trillion-in-fy26)

These figures measure demand for the task, from existing tools. They are third-party estimates or company claims, not usage of this tool.

## Privacy

Everything runs in your browser. There is no backend, no analytics and no account. Nothing you enter is uploaded.

## Run locally

No build step and no runtime dependencies. Serve the folder with any static server:

```
npx serve .
```

## Tests

The logic lives in `lib.js` as pure functions, tested with the Node test runner (Node 20+):

```
npm test
```

## Files

- `index.html` page and styles
- `app.js` wiring between the page and the logic
- `lib.js` pure logic, no DOM
- `lib.test.js` tests
- `base.css`, `ui.js` shared look and small DOM helpers

## Licence

MIT. Made by [Sushanth Kasturi](https://sushanth.avlokai.com).
