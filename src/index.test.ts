import type { SnippetOptions } from '.';

const testOrg = '123';

type FsQueue = unknown[][];
type FsWithQueue = { q?: FsQueue };

const getFsQueue = (ns = 'FS'): FsQueue | undefined => (
  (window[ns] as unknown as FsWithQueue | undefined)?.q
);

/** Browser-sdk init call (after snippet's own init); last matching entry wins. */
const findBrowserInitEnv = (ns = 'FS'): Record<string, unknown> | undefined => {
  const initCalls = getFsQueue(ns)?.filter((call) => call[0] === 'init') ?? [];
  // Snippet 2.1 pushes an init with orgId/host/script; browser SDK pushes a follow-up.
  const browserInit = initCalls.length > 1 ? initCalls[initCalls.length - 1] : initCalls[0];
  const initOptions = browserInit?.[1] as { env?: Record<string, unknown> } | undefined;
  return initOptions?.env;
};

/** Snippet's own init call (the first one), which carries the resolved orgId/host/script. */
const findSnippetInitEnv = (ns = 'FS'): Record<string, unknown> | undefined => {
  const initCalls = getFsQueue(ns)?.filter((call) => call[0] === 'init') ?? [];
  const initOptions = initCalls[0]?.[1] as { env?: Record<string, unknown> } | undefined;
  return initOptions?.env;
};

/** The `src` of the <script> tag the snippet injects to load fs.js. */
const injectedScriptSrc = (): string | undefined => {
  const scripts = document.querySelectorAll('script[data-fs-namespace]');
  expect(scripts).toHaveLength(1);
  return (scripts[0] as HTMLScriptElement).src;
};

beforeEach(() => {
  // Module-level init state lives in the SDK; re-import for a clean slate per test.
  jest.resetModules();
  Object.keys(window).forEach((key) => {
    const value = window[key as keyof Window];
    if (value && typeof value === 'function' && (value as FsWithQueue).q) {
      delete window[key as keyof Window];
    }
  });
  delete (window as { FS?: unknown }).FS;
  // The snippet appends to the shared jsdom document; drop prior tests' script tags so
  // `injectedScriptSrc()` can only ever see the one injected by the test at hand.
  document.querySelectorAll('script[data-fs-namespace]').forEach((el) => { el.remove(); });
});

describe('exports', () => {
  it('should export FullStory (capital S) as an alias of Fullstory (for legacy purposes 🐬🐬🐬)', async () => {
    const { FullStory, Fullstory } = await import('.');
    expect(FullStory).toBe(Fullstory);
  });
});

describe('init', () => {
  it('should throw error if not initialized with an orgId', async () => {
    const { init } = await import('.');
    expect(() => { init({} as SnippetOptions); }).toThrow();
  });

  it('should throw error if API called before init', async () => {
    const { Fullstory, init } = await import('.');
    try {
      Fullstory('log', { msg: 'my log' });
      throw new Error('this should have thrown');
    } catch (error) {
      expect((error as Error).message).toMatch(/Fullstory is not loaded/);
    }
    init({ orgId: testOrg });
    expect(() => { Fullstory('log', { msg: 'my log' }); }).not.toThrow();
  });

  it('should load FS onto the window under the default namespace', async () => {
    const { init } = await import('.');
    init({ orgId: testOrg });
    expect((window as unknown as { FS?: unknown }).FS).toBeDefined();
  });

  it('should pass runInIframe via FS init env', async () => {
    const { init } = await import('.');
    init({
      orgId: testOrg,
      recordCrossDomainIFrames: true,
    });
    expect(findBrowserInitEnv()?.runInIframe).toBe(true);
  });

  it('should pass isOuterScript via FS init env', async () => {
    const { init } = await import('.');
    init({
      orgId: testOrg,
      recordOnlyThisIFrame: true,
    });
    expect(findBrowserInitEnv()?.isOuterScript).toBe(true);
  });

  it('should stop recording when initialized with devMode', async () => {
    const { init } = await import('.');
    init({
      orgId: testOrg,
      devMode: true,
    });

    const queue = getFsQueue();
    expect(queue?.some((call) => call[0] === 'shutdown')).toBe(true);
  });

  it('should return whether initialized', async () => {
    const { init, isInitialized } = await import('.');
    expect(isInitialized()).toBe(false);

    init({
      orgId: testOrg,
    });

    expect(isInitialized()).toBe(true);
  });

  it('should load fs-debug.js when debug is set', async () => {
    const { init } = await import('.');
    init({
      orgId: testOrg,
      debug: true,
    });

    const script = document.querySelector('script[data-fs-namespace]') as HTMLScriptElement | null;
    expect(script?.src).toMatch(/fs-debug\.js/);
  });

  it('should pass sessionUid to FS init', async () => {
    const { init } = await import('.');
    const sessionUid = 'session-123';

    init({
      orgId: testOrg,
      sessionUid,
    });

    expect(findBrowserInitEnv()?.sessionUid).toBe(sessionUid);
  });

  it('should pass cookieDomain, appHost, and assetMapId via FS init env', async () => {
    const { init } = await import('.');
    init({
      orgId: testOrg,
      cookieDomain: 'example.com',
      appHost: 'app.fullstory.com',
      assetMapId: 'map-1',
      startCaptureManually: true,
    });

    const env = findBrowserInitEnv();
    expect(env?.cookieDomain).toBe('example.com');
    expect(env?.appHost).toBe('app.fullstory.com');
    expect(env?.assetMapId).toBe('map-1');
    expect(env?.captureOnStartup).toBe(false);
  });

  it('should use a custom namespace on window', async () => {
    const { init, Fullstory } = await import('.');
    init({
      orgId: testOrg,
      namespace: 'MyFS',
    });

    expect((window as unknown as { MyFS?: unknown }).MyFS).toBeDefined();
    expect(() => { Fullstory('log', { msg: 'ok' }); }).not.toThrow();
  });
});

describe('region resolution', () => {
  // fs.js only learns the org's region after it loads, so the SDK has to resolve it up
  // front or a regional org fetches fs.js and its settings from the na1 edge (VAL-10545).
  const euOrg = 'o-7Y9H-eu1';

  it('should fetch fs.js from the org region edge', async () => {
    const { init } = await import('.');
    init({ orgId: euOrg });

    expect(injectedScriptSrc()).toContain('edge.eu1.fullstory.com/s/fs.js');
  });

  it('should pass the regional host and script to the snippet init', async () => {
    const { init } = await import('.');
    init({ orgId: euOrg });

    const env = findSnippetInitEnv();
    expect(env?.host).toBe('eu1.fullstory.com');
    expect(env?.script).toBe('edge.eu1.fullstory.com/s/fs.js');
  });

  it('should regionalize the debug script', async () => {
    const { init } = await import('.');
    init({ orgId: euOrg, debug: true });

    expect(injectedScriptSrc()).toContain('edge.eu1.fullstory.com/s/fs-debug.js');
  });

  it('should regionalize an explicitly set Fullstory host', async () => {
    const { init } = await import('.');
    init({ orgId: euOrg, host: 'fullstory.com', appHost: 'app.fullstory.com' });

    expect(findSnippetInitEnv()?.host).toBe('eu1.fullstory.com');
    expect(findBrowserInitEnv()?.appHost).toBe('app.eu1.fullstory.com');
  });

  it('should leave a self-hosted proxy untouched', async () => {
    const { init } = await import('.');
    init({ orgId: euOrg, host: 'fs.example.com', script: 'fs.example.com/fs.js' });

    const env = findSnippetInitEnv();
    expect(env?.host).toBe('fs.example.com');
    expect(env?.script).toBe('fs.example.com/fs.js');
    expect(injectedScriptSrc()).toContain('fs.example.com/fs.js');
  });

  it('should not change the defaults for an org with no region', async () => {
    const { init } = await import('.');
    init({ orgId: testOrg });

    const env = findSnippetInitEnv();
    expect(env?.host).toBe('fullstory.com');
    expect(env?.script).toBe('edge.fullstory.com/s/fs.js');
    expect(injectedScriptSrc()).toContain('edge.fullstory.com/s/fs.js');
  });
});

describe('devMode', () => {
  let consoleWarnedMessage;
  const oldConsoleWarn = console.warn;
  beforeEach(() => {
    console.warn = (msg) => { consoleWarnedMessage = msg; };
  });

  afterEach(() => {
    console.warn = oldConsoleWarn;
    consoleWarnedMessage = undefined;
  });

  it('should return a message for functions invoked when in devMode', async () => {
    const { init, Fullstory } = await import('.');
    expect(consoleWarnedMessage).toBeUndefined();
    init({
      orgId: testOrg,
      devMode: true,
    });

    expect(consoleWarnedMessage).toMatch(/Fullstory was initialized in devMode/);

    Fullstory('log', { msg: 'hello world' });

    expect(consoleWarnedMessage).toBe('Fullstory is in dev mode and is not capturing: log not executed');
  });
});

describe('getCurrentSessionURL', () => {
  it('should return null before fs.js is fully bootstrapped', async () => {
    const { init, Fullstory } = await import('.');
    init({ orgId: testOrg });
    // in theory, this is a race condition - assuming that fs.js
    // can't load by the time the following statement is executed
    const url = Fullstory('getSession');
    expect(url).toBeNull();
  });
});

describe('typescript safety', () => {
  it('provides type assistance matching the api', async () => {
    const { init, Fullstory } = await import('.');
    // Just a quick non-exhaustive check that types are working as expected.
    // The "@ts-expect-error" declaration will fail if the types do NOT throw
    // an error.
    init({ orgId: testOrg });

    // Passes TypeScript check
    Fullstory('getSession', { format: 'url.now' });

    // Does not pass (improper format)
    // @ts-expect-error (for testing purposes)
    Fullstory('getSession', { format: '😏' });

    // Does not pass (invalid action)
    // @ts-expect-error (for testing purposes)
    Fullstory('🦄');

    // Passes TypeScript check
    Fullstory('observe', { type: 'start', callback: () => console.log('STARTED') });

    // Does not pass (improper type)
    // @ts-expect-error (for testing purposes)
    Fullstory('observe', { type: '🦂', callback: () => console.log('STARTED') });

    // Disconnector can be `void` type
    const disconnector = Fullstory('observe', { type: 'start', callback: () => console.log('STARTED') });

    // README(scottnorvell): statements where we _don't_ null check the disconnector
    // work in the editor but not on CI so I got rid of them 🤷‍♂️
    if (disconnector) {
      // passes
      disconnector.disconnect();
    }

    // LEGACY:
    // Passes TypeScript check
    Fullstory.setVars('user', { email: 'e@mail.com' });

    // Does not pass (improper VarScope)
    // @ts-expect-error (for testing purposes)
    Fullstory.setVars('🤯', { email: 'e@mail.com' });

    // Passes TypeScript check
    Fullstory.event('Order Complete', { product_id: 'asdf' });

    // Does not pass (eventName must be string)
    // @ts-expect-error (for testing purposes)
    Fullstory.event(42, { product_id: 'asdf' });

    // Assertion for posterity's sake...
    expect(true).toBe(true);
  });

  it('allows the optional "source" param', async () => {
    const { init, Fullstory } = await import('.');
    init({ orgId: testOrg });

    Fullstory('setProperties', {
      type: 'user',
      properties: {
        a: 'a',
        b: 'b',
        c: 'c'
      }
    }, 'segment-browser-actions');

    Fullstory.setUserVars({
      a: 'a',
      b: 'b',
      c: 'c'
    }, 'segment-browser-actions');

    Fullstory.setVars('page', {
      a: 'a',
      b: 'b',
      c: 'c'
    }, 'segment-browser-actions');

    Fullstory.event('Segment Event', {
      a: 'a',
      b: 'b',
      c: 'c'
    }, 'segment-browser-actions');
  });

  // NOTE: don't run this test, it will hang since fs.js isn't really running. It's only for typescript safety checks.
  it.skip('provides type assistance for the async api', async () => {
    const { init, Fullstory } = await import('.');
    init({ orgId: testOrg });

    const disconnector = await Fullstory('observeAsync', { type: 'start', callback: () => console.log('STARTED') });

    disconnector.disconnect();

    const url = await Fullstory('getSessionAsync');
    expect(url === null || typeof url === 'string' || typeof url === 'object').toBe(true); // type-check only
  });
});
