import { assert, expect } from 'chai';
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
    expect(() => { init({} as SnippetOptions); }).to.throw();
  });

  it('should throw error if API called before init', () => {
    try {
      FS('log', { msg: 'my log' });
      expect(false).to.be('this should have thrown');
    } catch (error) {
      expect((error as Error).message).to.match(/FullStory is not loaded/);
    }
    init({ orgId: testOrg });
    expect(() => { FS('log', { msg: 'my log' }); }).to.not.throw();
  });

  it('should add _fs_org value to window object', () => {
    init({ orgId: testOrg });
    expect(window._fs_org).to.equal(testOrg);
  });

  it('should add _fs_run_in_iframe value to window object', () => {
    init({
      orgId: testOrg,
      recordCrossDomainIFrames: true,
    });
    expect(window._fs_run_in_iframe).to.equal(true);
  });

  it('should add _fs_is_outer_script value to window object', () => {
    init({
      orgId: testOrg,
      recordOnlyThisIFrame: true,
    });
    expect(window._fs_is_outer_script).to.equal(true);
  });

  it('should add _fs_dev_mode value to window when initialzed with devMode', () => {
    init({
      orgId: testOrg,
      devMode: true,
    });

    expect(window._fs_dev_mode).to.equal(true);
  });

  it('should return whether initialized', () => {
    let isInit = isInitialized();
    expect(isInit).to.equal(false);

    init({
      orgId: testOrg,
    });

    isInit = isInitialized();
    expect(isInit).to.equal(true);
  });

  it('should load fs-debug.js when debug is set', () => {
    init({
      orgId: testOrg,
      debug: true,
    });

    expect(window._fs_script).to.match(/fs-debug.js$/);
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
    expect(consoleWarnedMessage).to.equal(undefined);
    init({
      orgId: testOrg,
      devMode: true,
    });

    expect(consoleWarnedMessage).to.match(/FullStory was initialized in devMode/);

    FS('log', { msg: 'hello world' });

    expect(consoleWarnedMessage).to.match(/FullStory is in dev mode/);
  });
});

describe('getCurrentSessionURL', () => {
  it('should return null before fs.js is fully bootstrapped', () => {
    init({ orgId: testOrg });
    // in theory, this is a race condition - assuming that fs.js
    // can't load by the time the following statement is executed
    const url = FS('getSession');
    assert.equal(
      url,
      null,
      'FullStory.getCurrentSessionURL() should return null if executed before fs.js is fully bootstrapped'
    );
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
    expect(true).to.equal(true);
  });
});
