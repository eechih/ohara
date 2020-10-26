/*
 * Copyright 2019 is-land
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { times } from 'lodash';

import * as volumeApi from 'api/volumeApi';
import { entity as volumeEntity } from 'api/__mocks__/volumeApi';
import { fetchVolume, startVolume } from '../volumes';

jest.mock('api/volumeApi');

const makeTestScheduler = () =>
  new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });

const RESPONSES = {
  success: {
    status: 200,
    title: 'retry mock get data',
    data: volumeEntity,
  },
  successWithRunning: {
    status: 200,
    title: 'retry mock get data',
    data: { ...volumeEntity, state: 'RUNNING' },
  },
  error: { status: -1, data: {}, title: 'mock get volume failed' },
};

it('get volume should be worked correctly', () => {
  makeTestScheduler().run(({ expectObservable }) => {
    const params = { group: volumeEntity.group, name: volumeEntity.name };

    const expected = '100ms (v|)';

    const output$ = fetchVolume(params);

    expectObservable(output$).toBe(expected, {
      v: volumeEntity,
    });
  });
});

it('get volume should be failed - Retry limit reached', () => {
  makeTestScheduler().run(({ expectObservable }) => {
    jest.restoreAllMocks();
    const spyGet = jest.spyOn(volumeApi, 'get');
    times(20, () => spyGet.mockReturnValueOnce(throwError(RESPONSES.error)));

    const params = { group: volumeEntity.group, name: volumeEntity.name };

    const expected = '#';

    const output$ = fetchVolume(params);

    expectObservable(output$).toBe(expected, null, RESPONSES.error);
  });
});

it('start volume should run in two minutes', () => {
  makeTestScheduler().run(({ expectObservable, flush }) => {
    jest.restoreAllMocks();
    const spyStart = jest.spyOn(volumeApi, 'start');
    const spyGet = jest.spyOn(volumeApi, 'get');
    times(5, () =>
      spyGet.mockReturnValueOnce(of(RESPONSES.success).pipe(delay(100))),
    );
    spyGet.mockReturnValueOnce(
      of(RESPONSES.successWithRunning).pipe(delay(100)),
    );

    const params = {
      group: volumeEntity.group,
      name: volumeEntity.name,
    };

    // start 1 time, get 6 times, retry 5 times
    // => 100ms * 1 + 100ms * 6 + 31s = 31700ms
    const expected = '31700ms (v|)';

    const output$ = startVolume(params, true);

    expectObservable(output$).toBe(expected, {
      v: RESPONSES.successWithRunning.data,
    });

    flush();

    expect(spyStart).toHaveBeenCalled();
    expect(spyGet).toHaveBeenCalled();
    expect(spyStart.mock.calls.length).toBe(1);
    expect(spyGet.mock.calls.length).toBe(6);
  });
});
