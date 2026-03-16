import {
  FullStory as FS,
  init,
  isInitialized,
  SnippetOptions,
} from '.';

const testOrg = '123';

beforeEach(() => {
  if (window[window._fs_namespace ?? '']) {
    delete window._fs_initialized;
    delete window._fs_dev_mode;
    delete window[window._fs_namespace ?? ''];
    delete window._fs_namespace;
  }
});

describe('init', () => {
  it('should throw error if not initialized with an orgId', () => {
    expect(() => { init({} as SnippetOptions); }).toThrow();
  });

  it('should throw error if API called before init', () => {
    try {
      FS('log', { msg: 'my log' });
      throw new Error('this should have thrown');
    } catch (error) {
      expect((error as Error).message).toMatch(/FullStory is not loaded/);
    }
    init({ orgId: testOrg });
    expect(() => { FS('log', { msg: 'my log' }); }).not.toThrow();
  });

  it('should add _fs_org value to window object', () => {
    init({ orgId: testOrg });
    expect(window._fs_org).toBe(testOrg);
  });

  it('should add _fs_run_in_iframe value to window object', () => {
    init({
      orgId: testOrg,
      recordCrossDomainIFrames: true,
    });
    expect(window._fs_run_in_iframe).toBe(true);
  });

  it('should add _fs_is_outer_script value to window object', () => {
    init({
      orgId: testOrg,
      recordOnlyThisIFrame: true,
    });
    expect(window._fs_is_outer_script).toBe(true);
  });

  it('should add _fs_dev_mode value to window when initialized with devMode', () => {
    init({
      orgId: testOrg,
      devMode: true,
    });

    expect(window._fs_dev_mode).toBe(true);
  });

  it('should return whether initialized', () => {
    let isInit = isInitialized();
    expect(isInit).toBe(false);

    init({
      orgId: testOrg,
    });

    isInit = isInitialized();
    expect(isInit).toBe(true);
  });

  it('should load fs-debug.js when debug is set', () => {
    init({
      orgId: testOrg,
      debug: true,
    });

    expect(window._fs_script).toMatch(/fs-debug.js$/);
  });

  it('should pass sessionUid to FS init', () => {
    const sessionUid = 'session-123';

    init({
      orgId: testOrg,
      sessionUid,
    });

    const queue = (window[window._fs_namespace ?? 'FS'] as unknown as { q?: unknown[][] }).q;
    const initCall = queue?.find((call) => call[0] === 'init');
    const initOptions = initCall?.[1] as { env?: { sessionUid?: string } } | undefined;

    expect(initOptions?.env?.sessionUid).toBe(sessionUid);
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

  it('should return a message for functions invoked when in devMode', () => {
    expect(consoleWarnedMessage).toBeUndefined();
    init({
      orgId: testOrg,
      devMode: true,
    });

    expect(consoleWarnedMessage).toMatch(/FullStory was initialized in devMode/);

    FS('log', { msg: 'hello world' });

    expect(consoleWarnedMessage).toBe('FullStory is in dev mode and is not capturing: log not executed');
  });
});

describe('getCurrentSessionURL', () => {
  it('should return null before fs.js is fully bootstrapped', () => {
    init({ orgId: testOrg });
    // in theory, this is a race condition - assuming that fs.js
    // can't load by the time the following statement is executed
    const url = FS('getSession');
    expect(url).toBeNull();
  });
});

describe('typescript safety', () => {
  it('provides type assistance matching the api', () => {
    // Just a quick non-exhaustive check that types are working as expected.
    // The "@ts-expect-error" declaration will fail if the types do NOT throw
    // an error.
    init({ orgId: testOrg });

    // Passes TypeScript check
    FS('getSession', { format: 'url.now' });

    // Does not pass (improper format)
    // @ts-expect-error (for testing purposes)
    FS('getSession', { format: '😏' });

    // Does not pass (invalid action)
    // @ts-expect-error (for testing purposes)
    FS('🦄');

    // Passes TypeScript check
    FS('observe', { type: 'start', callback: () => console.log('STARTED') });

    // Does not pass (improper type)
    // @ts-expect-error (for testing purposes)
    FS('observe', { type: '🦂', callback: () => console.log('STARTED') });

    // Disconnector can be `void` type
    const disconnector = FS('observe', { type: 'start', callback: () => console.log('STARTED') });

    // README(scottnorvell): statements where we _don't_ null check the disconnector
    // work in the editor but not on CI so I got rid of them 🤷‍♂️
    if (disconnector) {
      // passes
      disconnector.disconnect();
    }

    // LEGACY:
    // Passes TypeScript check
    FS.setVars('user', { email: 'e@mail.com' });

    // Does not pass (improper VarScope)
    // @ts-expect-error (for testing purposes)
    FS.setVars('🤯', { email: 'e@mail.com' });

    // Passes TypeScript check
    FS.event('Order Complete', { product_id: 'asdf' });

    // Does not pass (eventName must be string)
    // @ts-expect-error (for testing purposes)
    FS.event(42, { product_id: 'asdf' });

    // Assertion for posterity's sake...
    expect(true).toBe(true);
  });

  it('allows the optional "source" param', () => {
    init({ orgId: testOrg });

    FS('setProperties', {
      type: 'user',
      properties: {
        a: 'a',
        b: 'b',
        c: 'c'
      }
    }, 'segment-browser-actions');

    FS.setUserVars({
      a: 'a',
      b: 'b',
      c: 'c'
    }, 'segment-browser-actions');

    FS.setVars('page', {
      a: 'a',
      b: 'b',
      c: 'c'
    }, 'segment-browser-actions');

    FS.event('Segment Event', {
      a: 'a',
      b: 'b',
      c: 'c'
    }, 'segment-browser-actions');
  });

  // NOTE: don't run this test, it will hang since fs.js isn't really running. It's only for typescript safety checks.
  it.skip('provides type assistance for the async api', async () => {
    init({ orgId: testOrg });

    const disconnector = await FS('observeAsync', { type: 'start', callback: () => console.log('STARTED') });

    disconnector.disconnect();

    const url = await FS('getSessionAsync');
    expect(url === null || typeof url === 'string' || typeof url === 'object').toBe(true); // type-check only
  });
});
