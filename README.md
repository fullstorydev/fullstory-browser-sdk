# FullStory Browser SDK

[![CircleCI](https://circleci.com/gh/fullstorydev/fullstory-browser-sdk.svg?style=svg)](https://circleci.com/gh/fullstorydev/fullstory-browser-sdk)

FullStory's browser SDK lets you manage FullStory recording on your site as well as retrieve deep links to session replays and send your own custom events. More information about the FullStory API can be found at https://developer.fullstory.com.


## Install the SDK

#### with npm

```
npm i @fullstory/browser --save
```

#### with yarn
```
yarn add @fullstory/browser
```

## Initialize the SDK

Call the `init()` function with options as soon as you can in your website startup process.

### Configuration Options

The only required option is `orgId`, all others are optional.

*  `orgId` -  Sets your FullStory Org Id. Find out how to get your Org Id [here](https://help.fullstory.com/hc/en-us/articles/360047075853).
*  `debug` - When set to `true`, enables FullStory debug messages; defaults to `false`.
*  `host` - The recording server host domain. Can be set to direct recorded events to a proxy that you host. Defaults to `fullstory.com`.
*  `script` - FullStory script host domain. FullStory hosts the `fs.js` recording script on a CDN, but you can choose to host a copy yourself. Defaults to `edge.fullstory.com`.
* `namespace` - Sets the global identifier for FullStory when conflicts with `FS` arise; see [help](https://help.fullstory.com/hc/en-us/articles/360020624694-What-if-the-identifier-FS-is-used-by-another-script-on-my-site-).
* `recordCrossDomainIFrames` - Defaults to `false`. FullStory can record cross-domain iFrames if: 1. The FullStory Browser SDK is running in the cross-domain iFrame and 2. `recordCrossDomainIFrames` is set to `true` in the cross-domain iFrame and 3. The FullStory Browser SDK is running in the parent page of the cross-domain iFrame. Click [here](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy) for a detailed explanation of what "cross-domain" means. Before using, you should understand the security implications, and configure your [Content Security Policy](https://www.html5rocks.com/en/tutorials/security/content-security-policy/) (CSP) HTTP headers accordingly - specifically the frame-ancestors directive. Failure to configure your CSP headers while using this setting can bypass IFrames security protections that are included in modern browsers. More information about cross-domain iFrame recording can be found on our [Knowledge Base](https://help.fullstory.com/hc/en-us/articles/360020622514-Can-FullStory-capture-content-that-is-presented-in-iframes-#2-the-outer-page-is-running-fullstory-and-you-have-iframes-runni). Note: the `recordCrossDomainIFrames` parameter is the same as the `window['_fs_run_in_iframe']` referenced in the KB article.
* `recordOnlyThisIFrame` - When set to `true`, this tells FullStory that the IFrame is the "root" of the recording and should be its own session; defaults to `false`. Use this when your app is embedded in an IFrame on a site not running FullStory or when the site *is* running FullStory, but you want your content sent to a different FullStory org.
* `devMode` - Set to `true` if you want to deactivate FullStory in your development environment. When set to `true`, FullStory will shutdown recording and all subsequent SDK method calls will be no-ops. At the time `init` is called with `devMode: true`, a single `event` call will be sent to FullStory to indicate that the SDK is in `devMode`; this is to help trouble-shoot the case that the SDK was accidentally set to `devMode: true` in a production environment. Additionally, any calls to SDK methods will `console.warn` that FullStory is in `devMode`. Defaults to `false`.

### Initialization Examples

#### React

```JSX
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as FullStory from '@fullstory/browser';


FullStory.init({ orgId: '<your org id here>' });

ReactDOM.render(<App />, document.getElementById('root'));
```

#### Angular with `devMode` enabled

```javascript
import { Component } from '@angular/core';
import * as FullStory from '@fullstory/browser';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor() {
    FullStory.init({ orgId: '<your org id here>',
      devMode: !environment.production });
  }
}
```

#### Vue

```javascript
import Vue from 'vue';
import App from './App.vue';
import * as FullStory from '@fullstory/browser';

FullStory.init({ orgId: '<your org id here>' });
Vue.prototype.$FullStory = FullStory;

new Vue({
  render: h => h(App)
}).$mount('#app');
```

#### Vue 3

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import * as FullStory from '@fullstory/browser';

FullStory.init({ orgId: '<your org id here>' });

const app = createApp(App);
app.config.globalProperties.$FullStory = FullStory;
app.mount('#app');
```

## Using the SDK

Once FullStory is initialized, you can make calls to the FullStory SDK.

### Sending custom events

```JavaScript
FullStory.event('Subscribed', {
  uid_str: '750948353',
  plan_name_str: 'Professional',
  plan_price_real: 299,
  plan_users_int: 10,
  days_in_trial_int: 42,
  feature_packs: ['MAPS', 'DEV', 'DATA'],
});
```

### Generating session replay links

```JavaScript
const startOfPlayback = FullStory.getCurrentSessionURL();
const playbackAtThisMomentInTime = FullStory.getCurrentSessionURL(true);
```

### Sending custom page data
```JavaScript
FullStory.setVars('page', {
 pageName : 'Checkout', // what is the name of the page?
 cart_size_int : 10, // how many items were in the cart?
 used_coupon_bool : true, // was a coupon used?
});
```
For more information on setting page vars, view the FullStory help article on [Sending custom page data to FullStory](https://help.fullstory.com/hc/en-us/articles/1500004101581-FS-setVars-API-Sending-custom-page-data-to-FullStory).

#### Note
`FullStory.setVars(<scope>, <payload>)` currently only supports a string value of "page" for the scope. Using arbitrary strings for the scope parameter will result in an Error that will be logged to the browser console or discarded, depending on whether devMode or debug is enabled.
