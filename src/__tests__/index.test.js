/**
 * Tests for @signalio/tracking-snippet
 */

// ─── Mock fetch globally ─────────────────────────────────────────────────────
const mockFetch = jest.fn(() => Promise.resolve({ ok: true }));
global.fetch = mockFetch;

// ─── Import module under test ─────────────────────────────────────────────────
import signalio, { init, track, page, identify, reset } from '../index.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function lastPayload() {
  const call = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
  return JSON.parse(call[1].body);
}

beforeEach(() => {
  mockFetch.mockClear();
  reset();
  // Clear any stored anonymous ID between tests
  try {
    localStorage.clear();
  } catch (_e) {
    // ignore
  }
});

// ─── init() ──────────────────────────────────────────────────────────────────
describe('init()', () => {
  test('initializes without error given a valid trackingId', () => {
    expect(() => init('test-id-123')).not.toThrow();
  });

  test('throws when trackingId is missing', () => {
    expect(() => init()).toThrow('[signalio] init() requires a valid trackingId string.');
  });

  test('throws when trackingId is not a string', () => {
    expect(() => init(42)).toThrow('[signalio] init() requires a valid trackingId string.');
  });
});

// ─── track() ─────────────────────────────────────────────────────────────────
describe('track()', () => {
  beforeEach(() => init('test-id-123'));

  test('sends a track event to the endpoint', () => {
    track('Button Clicked', { label: 'Sign Up' });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toMatch(/\/events$/);
    expect(options.method).toBe('POST');

    const payload = JSON.parse(options.body);
    expect(payload.type).toBe('track');
    expect(payload.event).toBe('Button Clicked');
    expect(payload.properties).toEqual({ label: 'Sign Up' });
    expect(payload.trackingId).toBe('test-id-123');
  });

  test('includes a messageId, timestamp, anonymousId, and context', () => {
    track('Test Event');
    const payload = lastPayload();

    expect(payload.messageId).toBeDefined();
    expect(payload.timestamp).toBeDefined();
    expect(payload.anonymousId).toBeDefined();
    expect(payload.context).toBeDefined();
    expect(payload.context.library.name).toBe('@signalio/tracking-snippet');
  });

  test('defaults properties to empty object when omitted', () => {
    track('Minimal Event');
    const payload = lastPayload();
    expect(payload.properties).toEqual({});
  });

  test('throws when eventName is missing', () => {
    expect(() => track()).toThrow('[signalio] track() requires a valid eventName string.');
  });

  test('throws when eventName is not a string', () => {
    expect(() => track(123)).toThrow('[signalio] track() requires a valid eventName string.');
  });
});

// ─── page() ──────────────────────────────────────────────────────────────────
describe('page()', () => {
  beforeEach(() => init('test-id-123'));

  test('sends a page event', () => {
    page('Home', { path: '/' });

    const payload = lastPayload();
    expect(payload.type).toBe('page');
    expect(payload.name).toBe('Home');
    expect(payload.properties).toEqual({ path: '/' });
  });

  test('defaults properties to empty object when omitted', () => {
    page('About');
    const payload = lastPayload();
    expect(payload.properties).toEqual({});
  });

  test('uses empty string as name when pageName is omitted', () => {
    page();
    const payload = lastPayload();
    expect(typeof payload.name).toBe('string');
  });
});

// ─── identify() ──────────────────────────────────────────────────────────────
describe('identify()', () => {
  beforeEach(() => init('test-id-123'));

  test('sends an identify event', () => {
    identify('user-42', { name: 'Alice', email: 'alice@example.com' });

    const payload = lastPayload();
    expect(payload.type).toBe('identify');
    expect(payload.userId).toBe('user-42');
    expect(payload.traits).toEqual({ name: 'Alice', email: 'alice@example.com' });
  });

  test('subsequent track events include the userId', () => {
    identify('user-42');
    track('Something');

    const payload = lastPayload();
    expect(payload.userId).toBe('user-42');
  });

  test('defaults traits to empty object when omitted', () => {
    identify('user-42');
    const payload = lastPayload();
    expect(payload.traits).toEqual({});
  });

  test('throws when userId is missing', () => {
    expect(() => identify()).toThrow('[signalio] identify() requires a valid userId string.');
  });

  test('throws when userId is not a string', () => {
    expect(() => identify(99)).toThrow('[signalio] identify() requires a valid userId string.');
  });
});

// ─── Pre-init queue ───────────────────────────────────────────────────────────
describe('pre-init queue', () => {
  test('queues events called before init() and flushes on init()', () => {
    // Call track BEFORE init
    track('Early Event', { before: true });
    expect(mockFetch).not.toHaveBeenCalled();

    init('test-id-123');
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const payload = lastPayload();
    expect(payload.event).toBe('Early Event');
    expect(payload.trackingId).toBe('test-id-123');
  });

  test('flushes multiple queued events in order', () => {
    track('First');
    track('Second');
    page('Home');

    expect(mockFetch).not.toHaveBeenCalled();

    init('test-id-123');
    expect(mockFetch).toHaveBeenCalledTimes(3);

    const events = mockFetch.mock.calls.map((call) => JSON.parse(call[1].body));
    expect(events[0].event).toBe('First');
    expect(events[1].event).toBe('Second');
    expect(events[2].type).toBe('page');
  });
});

// ─── reset() ─────────────────────────────────────────────────────────────────
describe('reset()', () => {
  test('clears all state so events are queued again', () => {
    init('test-id-123');
    track('Before Reset');
    mockFetch.mockClear();

    reset();
    track('After Reset');
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

// ─── Custom endpoint ──────────────────────────────────────────────────────────
describe('custom endpoint', () => {
  test('sends events to a custom endpoint when provided', () => {
    init('test-id-123', { endpoint: 'https://custom.example.com/v2' });
    track('Custom Endpoint Test');

    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe('https://custom.example.com/v2/events');
  });
});

// ─── Default export ───────────────────────────────────────────────────────────
describe('default export', () => {
  test('exposes all public methods', () => {
    expect(typeof signalio.init).toBe('function');
    expect(typeof signalio.track).toBe('function');
    expect(typeof signalio.page).toBe('function');
    expect(typeof signalio.identify).toBe('function');
    expect(typeof signalio.reset).toBe('function');
  });
});
