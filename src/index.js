/**
 * @signalio/tracking-snippet
 * Tracking snippet for signalio.com
 *
 * Provides lightweight analytics tracking:
 * - init(trackingId, options) — initialize the tracker
 * - track(eventName, properties) — track a custom event
 * - page(pageName, properties) — track a page view
 * - identify(userId, traits) — identify a user
 */

const DEFAULT_ENDPOINT = 'https://t.signalio.com/v1';
const LIBRARY_VERSION = '__VERSION__';

let _trackingId = null;
let _endpoint = DEFAULT_ENDPOINT;
let _queue = [];
let _initialized = false;
let _userId = null;
let _anonymousId = null;

/**
 * Generate a random UUID v4.
 * @returns {string}
 */
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Retrieve or create a persistent anonymous ID from localStorage (if available).
 * @returns {string}
 */
function getAnonymousId() {
  if (_anonymousId) { return _anonymousId; }

  try {
    const stored = localStorage.getItem('_signalio_anon_id');
    if (stored) {
      _anonymousId = stored;
    } else {
      _anonymousId = generateId();
      localStorage.setItem('_signalio_anon_id', _anonymousId);
    }
  } catch (_e) {
    _anonymousId = generateId();
  }

  return _anonymousId;
}

/**
 * Return common context properties included with every event.
 * @returns {Object}
 */
function getContext() {
  const ctx = {
    library: { name: '@signalio/tracking-snippet', version: LIBRARY_VERSION },
  };

  if (typeof window !== 'undefined') {
    ctx.page = {
      url: window.location.href,
      referrer: document.referrer || '',
      title: document.title || '',
    };
    ctx.userAgent = navigator.userAgent || '';
    ctx.locale = navigator.language || '';
  }

  return ctx;
}

/**
 * Send a payload to the signalio endpoint via fetch (or XHR fallback).
 * @param {Object} payload
 */
function send(payload) {
  const url = `${_endpoint}/events`;

  const body = JSON.stringify(payload);

  if (typeof fetch !== 'undefined') {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(function () {
      // Silently ignore network errors to avoid breaking host pages.
    });
  } else if (typeof XMLHttpRequest !== 'undefined') {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(body);
  }
}

/**
 * Build and send a canonical event object.
 * @param {string} type  - 'track' | 'page' | 'identify'
 * @param {Object} data  - event-specific fields
 */
function dispatch(type, data) {
  const payload = Object.assign(
    {
      type,
      trackingId: _trackingId,
      anonymousId: getAnonymousId(),
      userId: _userId,
      timestamp: new Date().toISOString(),
      messageId: generateId(),
      context: getContext(),
    },
    data
  );

  if (!_initialized) {
    _queue.push(payload);
    return;
  }

  send(payload);
}

/**
 * Flush any events that were queued before init() was called.
 * Stamps the now-known trackingId onto each queued payload before sending.
 */
function flushQueue() {
  while (_queue.length > 0) {
    const payload = _queue.shift();
    payload.trackingId = _trackingId;
    send(payload);
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Initialize the tracker.
 * Must be called before tracking events.
 *
 * @param {string} trackingId - Your signalio.com tracking ID.
 * @param {Object} [options]
 * @param {string} [options.endpoint] - Override the default API endpoint.
 */
function init(trackingId, options) {
  if (!trackingId || typeof trackingId !== 'string') {
    throw new Error('[signalio] init() requires a valid trackingId string.');
  }

  _trackingId = trackingId;

  if (options && options.endpoint) {
    _endpoint = options.endpoint;
  }

  _initialized = true;
  flushQueue();
}

/**
 * Track a custom event.
 *
 * @param {string} eventName - Name of the event.
 * @param {Object} [properties] - Additional event properties.
 */
function track(eventName, properties) {
  if (!eventName || typeof eventName !== 'string') {
    throw new Error('[signalio] track() requires a valid eventName string.');
  }

  dispatch('track', { event: eventName, properties: properties || {} });
}

/**
 * Track a page view.
 *
 * @param {string} [pageName] - Name of the page. Defaults to document.title.
 * @param {Object} [properties] - Additional page properties.
 */
function page(pageName, properties) {
  const name =
    pageName ||
    (typeof document !== 'undefined' ? document.title : '') ||
    '';
  dispatch('page', { name, properties: properties || {} });
}

/**
 * Identify a user.
 *
 * @param {string} userId - Unique user identifier.
 * @param {Object} [traits] - Additional user traits.
 */
function identify(userId, traits) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('[signalio] identify() requires a valid userId string.');
  }

  _userId = userId;
  dispatch('identify', { userId, traits: traits || {} });
}

/**
 * Reset all internal state (useful for testing or on logout).
 */
function reset() {
  _trackingId = null;
  _endpoint = DEFAULT_ENDPOINT;
  _queue = [];
  _initialized = false;
  _userId = null;
  _anonymousId = null;
}

const signalio = { init, track, page, identify, reset };

export { init, track, page, identify, reset };
export default signalio;
