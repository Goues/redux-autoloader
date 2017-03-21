const reducerMountPoint = 'reduxAutoloader';
const getLoaderState = state => state[reducerMountPoint];

export const isInitialized = (state, loaderName) =>
  !!getLoaderState(state)[loaderName];

export const isLoading = (state, loaderName) =>
  getLoaderState(state)[loaderName].loading;

export const isRefreshing = (state, loaderName) =>
  getLoaderState(state)[loaderName].refreshing;

export const getData = (state, loaderName) =>
  getLoaderState(state)[loaderName].data;

export const getDataReceivedAt = (state, loaderName) =>
  getLoaderState(state)[loaderName].dataReceivedAt;

export const getError = (state, loaderName) =>
  getLoaderState(state)[loaderName].error;

export const getErrorReceivedAt = (state, loaderName) =>
  getLoaderState(state)[loaderName].errorReceivedAt;