# Fullstory Browser SDK

[![CircleCI](https://circleci.com/gh/fullstorydev/fullstory-browser-sdk.svg?style=svg)](https://circleci.com/gh/fullstorydev/fullstory-browser-sdk) [![npm (scoped)](https://img.shields.io/npm/v/@fullstory/browser)](https://www.npmjs.com/package/@fullstory/browser)

Fullstory's browser SDK lets you manage Fullstory data capture on your site as well as retrieve deep links to session replays and send your own custom events. More information about the Fullstory API can be found at https://developer.fullstory.com.

> **NOTE:** this is the documentation for version 2. For version 1 documentation, please see [@fullstory/browser@1.7.1](https://www.npmjs.com/package/@fullstory/browser/v/1.7.1).

## Install the SDK

#### with npm

```
npm i @fullstory/browser --save
```

#### with yarn
```
yarn add @fullstory/browser
```

## Migrating to Version 2.x.x
In version 2.x.x, `init` is a separate named export from `FullStory`. You will need to update all of your wildcard (`'*'`) imports to explicit named imports.

_Version 1.x.x_
```js
import * as FullStory from '@fullstory/browser';
```

_Version 2.x.x_
```js
import { FullStory, init } from '@fullstory/browser';
```

### `init`
You can use the named import `init` by itself:

```js
import { init } from '@fullstory/browser';

init({ orgId: 'my-org-id' })
```
You can also rename the function for readability:
```js
import { init as initFullStory } from '@fullstory/browser';

initFullStory({ orgId: 'my-org-id' })
```

### `FullStory`
The `FullStory` named export is equivalent to the global `FS` object described in the [developer documentation](https://developer.fullstory.com/browser/v2/getting-started/). You can use it to make all version 2 API calls:
```js
import { FullStory } from '@fullstory/browser';

FullStory('trackEvent', {
  name: 'My Event',
  properties: {
    product: 'Sprockets',
    quantity: 1,
  },
})
```

## Initialize the SDK

Call the `init()` function with options as soon as you can in your website startup process. Calling init after successful initialization will trigger console warnings - if you need to programmatically check if `FullStory` has been initialized at some point in your code, you can call `isInitialized()`.

### Configuration Options

The only required option is `orgId`, all others are optional.

*  `orgId` -  Sets your Fullstory Org Id. Find out how to get your Org Id [here](https://help.fullstory.com/hc/en-us/articles/360047075853).
*  `debug` - When set to `true`, enables Fullstory debug messages; defaults to `false`.
*  `host` - The recording server host domain. Can be set to direct recorded events to a proxy that you host. Defaults to `fullstory.com`.
*  `script` - Fullstory script host domain. Fullstory hosts the `fs.js` recording script on a CDN, but you can choose to host a copy yourself. Defaults to `edge.fullstory.com`.
* `namespace` - Sets the global identifier for Fullstory when conflicts with `FS` arise; see [help](https://help.fullstory.com/hc/en-us/articles/360020624694-What-if-the-identifier-FS-is-used-by-another-script-on-my-site-).
* `cookieDomain` - Overrides the cookie domain. By default, cookies will be valid for all subdomains of your site; if you want to limit the cookies to a specific subdomain, you can set the domain value explicitly. More information can be found [here](https://help.fullstory.com/hc/en-us/articles/360020622874-Can-the-Fullstory-cookie-be-associated-with-a-specific-subdomain-).
* `recordCrossDomainIFrames` - Defaults to `false`. Fullstory can record cross-domain iFrames if: 1. The Fullstory Browser SDK is running in the cross-domain iFrame and 2. `recordCrossDomainIFrames` is set to `true` in the cross-domain iFrame and 3. The Fullstory Browser SDK is running in the parent page of the cross-domain iFrame. Click [here](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy) for a detailed explanation of what "cross-domain" means. Before using, you should understand the security implications, and configure your [Content Security Policy](https://www.html5rocks.com/en/tutorials/security/content-security-policy/) (CSP) HTTP headers accordingly - specifically the frame-ancestors directive. Failure to configure your CSP headers while using this setting can bypass IFrames security protections that are included in modern browsers. More information about cross-domain iFrame recording can be found on our [Knowledge Base](https://help.fullstory.com/hc/en-us/articles/360020622514-Can-Fullstory-capture-content-that-is-presented-in-iframes-#2-the-outer-page-is-running-fullstory-and-you-have-iframes-runni). Note: the `recordCrossDomainIFrames` parameter is the same as the `window['_fs_run_in_iframe']` referenced in the KB article.
* `recordOnlyThisIFrame` - When set to `true`, this tells Fullstory that the IFrame is the "root" of the recording and should be its own session; defaults to `false`. Use this when your app is embedded in an IFrame on a site not running Fullstory or when the site *is* running Fullstory, but you want your content sent to a different Fullstory org.
* `devMode` - Set to `true` if you want to deactivate Fullstory in your development environment. When set to `true`, Fullstory will shutdown recording and all subsequent SDK method calls will be no-ops. At the time `init` is called with `devMode: true`, a single `event` call will be sent to Fullstory to indicate that the SDK is in `devMode`; this is to help trouble-shoot the case that the SDK was accidentally set to `devMode: true` in a production environment. Additionally, any calls to SDK methods will `console.warn` that Fullstory is in `devMode`. Defaults to `false`.
* `startCaptureManually` - Set to `true` if you want to start capture manually using `FS('start')`. Fullstory will load but wait for a call to `FS('start')` to begin capturing. See [Manually Delay Data Capture](https://developer.fullstory.com/browser/v2/auto-capture/capture-data/#manually-delay-data-capture) for more information.  Defaults to `false`.
* `assetMapId` - Use this to set the current asset map id. See [Asset Uploading for Web](https://help.fullstory.com/hc/en-us/articles/4404129191575-Asset-Uploading-for-Web) for more information.
* `appHost` - Use this to set the app host for displaying session urls. If using a version of [Fullstory Relay](https://help.fullstory.com/hc/en-us/articles/360046112593-How-to-send-captured-traffic-to-your-First-Party-Domain-using-Fullstory-Relay), you may need to set `appHost` "app.fullstory.com" or "app.eu1.fullstory.com" depending on your region.

### Ready Callback

The `init` function also accepts an optional `readyCallback` argument. If you provide a function, it will be invoked when the Fullstory session has started. Your callback will be called with one parameter: an object containing information about the session. Currently the only property is `sessionUrl`, which is a string containing the URL to the session.

```javascript
import { init } from '@fullstory/browser';

init({ orgId }, ({ sessionUrl }) => console.log(`Started session: ${sessionUrl}`));
```

### Initialization Examples

#### React

```JSX
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { init as initFullStory } from '@fullstory/browser';


initFullStory({ orgId: '<your org id here>' });

ReactDOM.render(<App />, document.getElementById('root'));
```

#### Angular with `devMode` enabled

```javascript
import { Component } from '@angular/core';
import { init as initFullStory } from '@fullstory/browser';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor() {
    initFullStory({
      orgId: '<your org id here>',
      devMode: !environment.production,
    });
  }
}
```

#### Vue

```javascript
import Vue from 'vue';
import App from './App.vue';
import { init as initFullStory, FullStory } from '@fullstory/browser';

initFullStory({ orgId: '<your org id here>' });
Vue.prototype.$FullStory = FullStory;

new Vue({
  render: h => h(App)
}).$mount('#app');
```

#### Vue 3

```javascript
import { createApp } from 'vue';
import App from './App.vue';
import { init as initFullStory, FullStory } from '@fullstory/browser';

initFullStory({ orgId: '<your org id here>' });

const app = createApp(App);
app.config.globalProperties.$FullStory = FullStory;
app.mount('#app');
```

## Using the SDK

Once FullStory is initialized, you can make calls to the FullStory SDK. See the [developer documentation](https://developer.fullstory.com/browser/v2/getting-started/) for more information.

### Sending custom events

```JavaScript
FullStory('trackEvent', {
  name: 'Subscribed',
  properties: {
    uid: '750948353',
    plan_name: 'Professional',
    plan_price: 299,
    plan_users: 10,
    days_in_trial: 42,
    feature_packs: ['MAPS', 'DEV', 'DATA'],
  },
  schema: {
    properties: {
      plan_users: 'int', // override default inferred "real" type with "int"
      days_in_trial: 'int', // override default inferred "real" type with "int"
    }
  }
});
```

> **NOTE:** The inclusion of type suffixes - appending `_str` or `_int` to the end of properties - is no longer required. All custom properties are inferred on the server. To override any default inference, you can add a `schema`. See [Custom Properties](https://developer.fullstory.com/browser/v2/custom-properties/) for more information.

### Generating session replay links

```JavaScript
const startOfPlayback = FullStory('getSession');
const playbackAtThisMomentInTime = FullStory('getSession', { format: 'url.now' });
```

### Sending custom user properties
```JavaScript
FullStory('setProperties', {
  type: 'user',
  properties: {
    displayName: 'Daniel Falko',
    email: 'daniel.falko@example.com',
    pricing_plan: 'free',
    popup_help: true,
    total_spent: 14.50,
  },
});
```
For more information on sending custom user properties, view the Fullstory help article on [Capturing custom user properties](https://help.fullstory.com/hc/en-us/articles/360020623294).

### Sending custom page properties
```JavaScript
FullStory('setProperties', {
  type: 'page',
  properties: {
    pageName: 'Checkout', // what is the name of the page?
    cart_size: 10, // how many items were in the cart?
    used_coupon: true, // was a coupon used?
  },
  schema: {
    properties: {
      cart_size: 'int', // override default inferred "real" type with "int"
    }
  }
});
```
For more information on setting page properties, view the Fullstory help article on [Sending custom page data to Fullstory](https://help.fullstory.com/hc/en-us/articles/1500004101581-FS-setVars-API-Sending-custom-page-data-to-Fullstory).
