# FullStory Browser SDK

[![CircleCI](https://circleci.com/gh/fullstorydev/fullstory-browser-sdk.svg?style=svg)](https://circleci.com/gh/fullstorydev/fullstory-browser-sdk)

## This is a WIP and is not currently published to NPM

FullStory's browser SDK lets you manage FullStory recording on your site as well as retrieve deep links to session replays and send your own custom events. More information about the FullStory's browser SDK and HTTP API can be found at https://developer.fullstory.com.

## Initialize the SDK

Call the `init()` function as soon as you can in your website startup process. 

Here's an example of what this would look like in a React app:
```JSX
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import FullStory from 'TBD/package-to-be-deployed';


FullStory.init('<your org id here>');

ReactDOM.render(<App />, document.getElementById('root'));
```

## Examples

Once FullStory is initialized, you can make calls to FullStory the SDK.

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