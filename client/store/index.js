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

  // Rakam analytics support - using npm package appears to be uncommon, but
  // is nice for consistency and bundling
  // Root URL + /analytics
  const analyticsURL = '//' + window.location.host + '/analytics';
  const analyticsWriteKey = process.env.ANALYTICS_KEY;
  rakam.init(analyticsWriteKey, null, {
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
    if (state.userSettings.track || process.env.NODE_ENV === 'development') {
      rakam.logEvent(type, { ...state.analytics, ...payload });
    }
  });

  middlewares.push(logger);
  middlewares.push(analyticsMiddleware);
}
/* eslint-enable global-require */


const store = createStore(
  rootReducer,
  applyMiddleware(...middlewares)
);

export default store;
