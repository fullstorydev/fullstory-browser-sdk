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

| Option | Required | Description |
| ------ | -------- | ----------- |
| orgId  | yes | Sets your FullStory Org ID. |
| debug | no | When set to `true`, enables FullStory debug messages; defaults to `false`. |
| namespace | no | Sets the global identifier for FullStory when conflicts with `FS` arise; see [help](https://help.fullstory.com/hc/en-us/articles/360020624694-What-if-the-identifier-FS-is-used-by-another-script-on-my-site-). |
| recordCrossDomainIFrames | no | When set to `true`, FullStory is added to cross-domain IFrames and records content; defaults to `false`. Before using, you should understand the security implications, and configure your [Content Security Policy](https://www.html5rocks.com/en/tutorials/security/content-security-policy/) (CSP) HTTP headers accordingly - specifically the frame-ancestors directive. Failure to configure your CSP headers while using this setting can bypass IFrames security protections that are included in modern browsers. |
| recordOnlyThisIFrame | no | When set to `true`, this tells FullStory that the IFrame is the "root" of the recording and should be its own session; defaults to `false`. Use this when your app is embedded in an IFrame on a site not running FullStory or when the site *is* running Fullstory, but you want your content sent to a different FullStory org. |

Here's an example of initializing the SDK in a React app.

```JSX
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as FullStory from '@fullstory/browser';


FullStory.init({ orgId: '<your org id here>' });

ReactDOM.render(<App />, document.getElementById('root'));
```

Here's an example of initializing the SDK in an Angular app with debug enabled for troubleshooting purposes.

```javascript
import { Component } from '@angular/core';
import * as FullStory from '@fullstory/browser';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor() {
    FullStory.init({ orgId: '<your org id here>', debug: true });
  }
}
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