# @signalio/tracking-snippet

[![CI](https://github.com/signaliorev/tracking-snippet/actions/workflows/publish.yml/badge.svg)](https://github.com/signaliorev/tracking-snippet/actions/workflows/publish.yml)
[![npm version](https://img.shields.io/npm/v/@signalio/tracking-snippet.svg)](https://www.npmjs.com/package/@signalio/tracking-snippet)
[![License](https://img.shields.io/github/license/signaliorev/tracking-snippet)](LICENSE)

Lightweight analytics tracking snippet for [signalio.com](https://signalio.com).

Ships as **CJS**, **ESM**, and **UMD** bundles — works in the browser, in Node.js,
and as a `<script>` tag drop-in.

---

## Installation

```bash
npm install @signalio/tracking-snippet
```

Or load directly from a CDN:

```html
<script src="https://unpkg.com/@signalio/tracking-snippet/dist/index.umd.js"></script>
```

---

## Quick start

```js
import signalio from '@signalio/tracking-snippet';

// 1. Initialize with your tracking ID (get one at signalio.com)
signalio.init('YOUR_TRACKING_ID');

// 2. Track a page view
signalio.page();

// 3. Track a custom event
signalio.track('Button Clicked', { label: 'Sign Up' });

// 4. Identify a user
signalio.identify('user-123', { name: 'Alice', plan: 'pro' });
```

---

## API

### `signalio.init(trackingId, [options])`

Initialize the tracker. Must be called before sending events.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `trackingId` | `string` | ✅ | Your signalio.com tracking ID. |
| `options.endpoint` | `string` | | Override the default API endpoint. |

> **Tip:** You may call `track()`, `page()`, or `identify()` before `init()` — events
> are queued and automatically flushed once `init()` is called.

---

### `signalio.track(eventName, [properties])`

Track a custom event.

```js
signalio.track('Purchase Completed', {
  revenue: 49.99,
  currency: 'USD',
});
```

---

### `signalio.page([pageName], [properties])`

Track a page view.

```js
signalio.page('Home', { path: '/' });
// or auto-detect title:
signalio.page();
```

---

### `signalio.identify(userId, [traits])`

Associate the current session with a known user.

```js
signalio.identify('user-123', {
  name: 'Alice',
  email: 'alice@example.com',
});
```

---

### `signalio.reset()`

Clear all internal state (e.g. on logout).

---

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Lint
npm run lint

# Build distribution bundles
npm run build
```

---

## Automated publishing

Releases are published to npm automatically via GitHub Actions whenever a version
tag (`v*`) is pushed:

```bash
# Bump the version
npm version patch   # or minor / major

# Push the tag — the publish workflow runs automatically
git push --follow-tags
```

The workflow requires an `NPM_TOKEN` secret to be set in the repository settings.

---

## License

[Apache 2.0](LICENSE) © signalio
