import { assert, expect } from 'chai';
import FullStory from '../src';

const testOrg = '123';

beforeEach(() => {
  if (window[window._fs_namespace]) {
    delete window._fs_initialized;
    delete window[window._fs_namespace];
    delete window._fs_namespace;
  }
});

describe('core', () => {
  it('should define snippet functions', () => {
    const functions = ['event',
      'log',
      'getCurrentSessionURL',
      'identify',
      'setUserVars',
      'consent',
      'shutdown',
      'restart'];

    functions.forEach(i => assert(typeof FullStory[i] === 'function', `${i} has not been exported from the FullStory module`));
  });

  it('should throw error if API called before init', () => {
    expect(() => { FullStory.log(); }).to.throw();
    FullStory.init({ orgId: testOrg });
    expect(() => { FullStory.log(); }).to.not.throw();
  });
});

describe('init', () => {
  it('should throw error if not initialized with an orgId', () => {
    expect(() => { FullStory.init(); }).to.throw();
  });

  it('should add _fs_org value to window object', () => {
    FullStory.init({ orgId: testOrg });
    expect(window._fs_org).to.equal(testOrg);
  });
});
