# redux-autoloader

[![npm version](https://badge.fury.io/js/redux-autoloader.svg)](https://badge.fury.io/js/redux-autoloader)
[![Download Count](http://img.shields.io/npm/dm/redux-autoloader.svg?style=flat-square)](https://npmjs.org/package/redux-autoloader)

> A higher order component for declarative data loading in React and Redux.

## Install

1. Install via NPM

  ```
  npm install --save redux-autoloader
  ```

2. Register reducer in your root reducer

  The reducer must be mounted at `reduxAutoloader`.

  ```js
  import { reducer as reduxAutoloaderReducer } from 'redux-autoloader';

  const rootReducer = combineReducers({
    ...
    reduxAutoloader: reduxAutoloaderReducer,
    ...
  });
  ```

3. Register saga

  ```js
  import { saga as reduxAutoloaderSaga } from 'redux-autoloader';

  ...
  sagaMiddleware.run(reduxAutoloaderSaga);
  ...
  ```

## Peer dependencies

* react
* redux
* react-redux
* redux-saga

## Try demo locally

```
git clone git clone https://github.com/woltapp/redux-autoloader.git
cd redux-autoloader
npm install
npm start
```

## What problem does the library solve?

Attaching an API end-point to a view is such a common task that we decided
to create a module to remove unnecessary boilerplate from most of the views
and to greatly speed up the development.
With `redux-autoloader` you can decorate _any_ component and automatically
load data from an API. The higher order component will provide you the props for
handling the state; whether it returned data, is currently loading or returned
an error. Moreover, the data can be automatically reloaded both periodically
or manually. The library removes the tedious work of writing the logic of
handling common request/success/failure state, registering refreshing
and cache invalidation.

## Examples

#### Super simple data loader

```jsx
const ExampleComponent = ({
  data,       // provided by reduxAutoloader
  error,      // provided by reduxAutoloader
  isLoading,  // provided by reduxAutoloader
}) = (
  <div>
    {isLoading && 'Loading data'}

    {error ? JSON.stringify(error) : (
      <div>
        Your data: {JSON.stringify(data)}
      </div>
    )}
  </div>
);

const ConnectedComponent = reduxAutoloader({
  name: 'example-loader-1',   // A unique name for the loader
  apiCall: yourDataFech,      // A function that returns a promise
})(ExampleComponent);
```

#### Set cache expiration and prevent excessive page loads

```jsx
const ConnectedComponent = reduxAutoloader({
  name: 'example-loader-2',
  apiCall: yourDataFech,
  reloadOnMount: false,       // Prevent triggering reload on mount, default: true
  cacheExpiresIn: 60000,      // Set cache expiration time: data will be
                              // loaded on mount after 1 minute even if reloadOnMount=false
})(ExampleComponent);
```

#### Set auto-refresh

```jsx
const ConnectedComponent = reduxAutoloader({
  name: 'example-loader-3',
  apiCall: yourDataFech,
  autoRefreshInterval: 5000,  // Set loader to automatically refetch data every 5 seconds.
                              // Can be stopped by calling props.stopRefresh().
})(ExampleComponent);
```

## API Documentation

`reduxAutoloader(options, mapStateToProps)` takes `options` (Object) as
first _(required)_ argument and `mapStateToProps` (Function) as second _(optional)_ argument.

### Options

* __`name`__ _(String|Function -> String)_: A unique name for the loader (string) or a function that
returns a name. If you make multiple loaders with the same name, they will share the same
data (state).
    - always required
    - example: `name: 'all-users'`
    - example: ``name: props => `user-loader-${props.userId}` ``

* __`apiCall`__ _(Function -> Promise)_: A function that returns a promise, which is usually
an API call. If you want to provide arguments for the function, simply wrap it in a function
that gets `props` as an argument. If left undefined, `reduxAutoloader` can be used
simply as a connector to the data state.
    - example: `apiCall: props => fetchUser(props.userId)`
    - default: `undefined`

* __`autoRefreshInterval`__ _(Number)_: Provide an integer in milliseconds to define
the interval of automatic refreshing. If set to `0` or `undefined`, automatic refresh
won't be started.
    - default: `0` (no auto refreshing)

* __`cacheExpiresIn`__ _(Number)_: Set the data expiration time, leavy empty for no expiration.
If set, cache expiration will be checked on `componentWillMount`. Use with `reloadOnMount: false` to
e.g. prevent excessive page loads.
    - default: `0` (no expiration)

* __`reloadOnMount`__ _(Bool)_: Control whether reload is done always on component re-mount.
    - default: `true`

* __`resetOnUnmount`__ _(Bool)_: Control whether to completely reset data-loader state on unmount.
    - default: `true`

* __`reinitialize`__ _(Function -> Bool)_: This function is run when the decorated component
receives new props. The function takes `props` (current props) as first argument
and `nextProps` as second. When the function returns `true`
    - example: `reinitialize: (props, nextProps) => props.userId !== nextProps.userId`
    - default: `() => false`
    - __! NOTE !__ setting `reinitialize: () => true` or any other function that returns
    always true will cause an infinite loop (do not do this!)

### mapStateToProps

`mapStateToProps` is an optional function to provide if you want to
select only some props of the loader state or wish to rename them.

Example:

```js
const ConnectedComponent = reduxAutoloader(options, state => ({
  isLoadingUsers: state.isLoading,
  users: state.data,
}));
```

### Props

Props provided to the wrapped component.

* __`isLoading`__ _(Bool)_: `true` if `apiCall` is triggered and not yet resolved.
* __`isRefreshing`__ _(Bool)_: `true` if loader is auto-refreshing.
* __`data`__ _(any)_: Resolved data received from the apiCall Promise.
* __`dataReceivedAt`__ _(Number)_: Datetime as UNIX epoch when data was received.
* __`error`__ _(any)_: Rejected data received from the apiCall Promise.
* __`errorReceivedAt`__ _(Number)_: Datetime as UNIX epoch when error was received.
* __`refresh`__ _(Function)_: Call to refresh (reload) data immediately.
* __`startAutoRefresh`__ _(Function)_: Call to start auto-refreshing. Takes `refreshInterval` as first optional argument.
* __`stopAutoRefresh`__ _(Function)_: Call to stop auto-refreshing.


## License

MIT