import { assert, expect } from 'chai';
import * as FullStory from '../src';

const testOrg = '123';

beforeEach(() => {
  if (window[window._fs_namespace]) {
    delete window._fs_initialized;
    delete window[window._fs_namespace];
    delete window._fs_namespace;
  }
});

describe('core', () => {
  it('should define browser API functions', () => {
    const functions = ['anonymize',
      'event',
      'log',
      'getCurrentSessionURL',
      'identify',
      'init',
      'setUserVars',
      'consent',
      'shutdown',
      'restart'];

    functions.forEach(i => assert(typeof FullStory[i] === 'function', `${i} has not been exported from the FullStory module`));
  });
});

describe('init', () => {
  it('should throw error if not initialized with an orgId', () => {
    expect(() => { FullStory.init(); }).to.throw();
  });

  it('should throw error if API called before init', () => {
    expect(() => { FullStory.log(); }).to.throw();
    FullStory.init({ orgId: testOrg });
    expect(() => { FullStory.log(); }).to.not.throw();
  });

  it('should add _fs_org value to window object', () => {
    FullStory.init({ orgId: testOrg });
    expect(window._fs_org).to.equal(testOrg);
  });
});

describe('getCurrentSessionURL', () => {
  it('should return null before fs.js is fully bootstrapped', () => {
    FullStory.init({ orgId: 'test' });
    // in theory, this is a race condition - assuming that fs.js
    // can't load by the time the following statement is executed
    const url = FullStory.getCurrentSessionURL();
    assert.equal(url, null, 'FullStory.getCurrentSessionURL() should return null if executed before fs.js is fully bootstrapped');
  });
});
