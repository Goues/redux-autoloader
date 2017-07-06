import { cancel, call, put, fork, take } from 'redux-saga/effects';
import { createMockTask } from 'redux-saga/utils';

import {
  manualRefresh,
  fetchDataRequest,
  startRefresh,
  stopRefresh,
} from './actions';
import {
  START_REFRESH,
  STOP_REFRESH,
  MANUAL_REFRESH,
} from './actionTypes';
import {
  fetchData,
  dataLoaderFlow,
  autoRefresh,
} from './sagas';

describe('fetchData', () => {
  const fakeApi = sinon.stub().returns(Promise.resolve('testresult'));
  const mockProps = { testProp: 'test' };

  it('should call api', () => {
    const gen = fetchData(manualRefresh('test-loader', { apiCall: fakeApi, props: mockProps }));

    expect(gen.next().value).to.eql(put(fetchDataRequest('test-loader', {
      apiCall: fakeApi,
      props: mockProps,
    })));
    expect(gen.next().value).to.eql(call(fakeApi, mockProps));
  });
});

describe('dataLoaderFlow', () => {
  const fakeApi = sinon.stub().returns(Promise.resolve('testresult'));
  const mockProps = { testProp: 'test' };
  const startRefreshAction = startRefresh('test-loader', { apiCall: fakeApi, props: mockProps });
  const stopRefreshAction = stopRefresh('test-loader', { apiCall: fakeApi, props: mockProps });
  const manualRefreshAction = manualRefresh('test-loader', { apiCall: fakeApi, props: mockProps });

  let gen;

  beforeEach(() => {
    gen = dataLoaderFlow();
  });

  describe('on START_REFRESH action', () => {
    it('should take START_REFRESH action', () => {
      expect(gen.next(startRefreshAction).value)
        .to.eql(take([START_REFRESH, STOP_REFRESH, MANUAL_REFRESH]));
    });

    it('should fork autoRefresh', () => {
      gen.next(startRefreshAction);
      expect(gen.next(startRefreshAction).value).to.eql(fork(autoRefresh, startRefreshAction));
    });
  });

  describe('on STOP_REFRESH action', () => {
    it('should take STOP_REFRESH action', () => {
      expect(gen.next(startRefreshAction).value)
        .to.eql(take([START_REFRESH, STOP_REFRESH, MANUAL_REFRESH]));
    });

    it('should cancel autoRefresh task it is running', () => {
      const mockLoaderTask = createMockTask();
      mockLoaderTask.name = 'autoRefresh';
      gen.next(startRefreshAction);
      gen.next(startRefreshAction);
      gen.next(mockLoaderTask);
      expect(gen.next(stopRefreshAction).value).to.eql(cancel(mockLoaderTask));
    });
  });

  describe('on MANUAL_REFRESH action', () => {
    it('should take MANUAL_REFRESH action', () => {
      expect(gen.next(startRefreshAction).value)
        .to.eql(take([START_REFRESH, STOP_REFRESH, MANUAL_REFRESH]));
    });

    it('should call fetchData if autoRefresh is not running', () => {
      gen.next();

      expect(gen.next(manualRefreshAction).value).to.eql(call(fetchData, manualRefreshAction));
    });

    it('should not call fetchData if autoRefresh is running', () => {
      gen.next();
      gen.next(startRefreshAction);
      gen.next(startRefreshAction);

      expect(gen.next(manualRefreshAction).value).to.not.eql(call(fetchData, manualRefreshAction));
    });
  });
});
