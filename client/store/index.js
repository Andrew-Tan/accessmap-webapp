import { createStore, applyMiddleware } from 'redux';

import thunkMiddleware from 'redux-thunk';
import analytics from 'redux-analytics';
import rakam from 'rakam-js';

import rootReducer from 'reducers';

const middlewares = [];
middlewares.push(thunkMiddleware);

/* eslint-disable global-require */
if (process.env.NODE_ENV === 'development') {
  const { logger } = require('redux-logger');
  middlewares.push(logger);
}

//
// Rakam analytics support - using npm package appears to be uncommon, but
// is nice for consistency and bundling
//
// TODO: get user settings to set this on production server. Override is just
// for doing one-off user testing studies (NOT main site).

// Root URL + /analytics
const useAnalytics = process.env.FORCE_ANALYTICS === 'yes' ? true : false;
if (useAnalytics) {
  const analyticsURL = '//' + window.location.host + '/analytics';
  const analyticsWriteKey = process.env.ANALYTICS_KEY;
  rakam.init(analyticsWriteKey, window.location._emissionId, {
    apiEndpoint: analyticsURL,
    includeUtm: true,
    trackClicks: true,
    trackForms: true,
    includeReferrer: true
  });

  // Get Emission ID
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(window.location._emissionId)) {
    console.log("user id received:", window.location._emissionId);
    rakam.setUserId(window.location._emissionId);
  } else {
    console.log("user id not found, stop!");
    window.stop();
  }

  const analyticsMiddleware = analytics(({ type, payload }, state) => {
    rakam.logEvent(type, { ...state.analytics, ...payload });
  });

  middlewares.push(analyticsMiddleware);

}

const store = createStore(
  rootReducer,
  applyMiddleware(...middlewares)
);

export default store;
