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

import { noop, throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

import { LOG_LEVEL } from 'const';
import * as shabondiApi from 'api/shabondiApi';
import deleteShabondiEpic from '../../shabondi/deleteShabondiEpic';
import * as actions from 'store/actions';
import { getId } from 'utils/object';
import { entity as shabondiEntity } from 'api/__mocks__/shabondiApi';

jest.mock('api/shabondiApi');
const mockedPaperApi = jest.fn(() => {
  return {
    updateElement: () => noop(),
    removeElement: () => noop(),
  };
});
const paperApi = new mockedPaperApi();

const shabondiId = getId(shabondiEntity);

beforeEach(() => {
  // ensure the mock data is as expected before each test
  jest.restoreAllMocks();
});

const makeTestScheduler = () =>
  new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });

it('should delete a shabondi', () => {
  makeTestScheduler().run(helpers => {
    const { hot, expectObservable, expectSubscriptions, flush } = helpers;

    const input = '   ^-a           ';
    const expected = '--a 999ms (uv)';
    const subs = '    ^-------------';

    const action$ = hot(input, {
      a: {
        type: actions.deleteShabondi.TRIGGER,
        payload: {
          params: shabondiEntity,
          options: { paperApi },
        },
      },
    });
    const output$ = deleteShabondiEpic(action$);

    expectObservable(output$).toBe(expected, {
      a: {
        type: actions.deleteShabondi.REQUEST,
        payload: {
          shabondiId,
        },
      },
      u: {
        type: actions.setSelectedCell.TRIGGER,
        payload: null,
      },
      v: {
        type: actions.deleteShabondi.SUCCESS,
        payload: {
          shabondiId,
        },
      },
    });

    expectSubscriptions(action$.subscriptions).toBe(subs);

    flush();
  });
});

it('should delete multiple shabondis', () => {
  makeTestScheduler().run(helpers => {
    const { hot, expectObservable, expectSubscriptions, flush } = helpers;

    const input = '   ^-a---b               ';
    const expected = '--a---b 995ms (uv)(xy)';
    const subs = '    ^---------------------';
    const anotherShabondiEntity = {
      ...shabondiEntity,
      name: 'anothershabondi',
    };

    const action$ = hot(input, {
      a: {
        type: actions.deleteShabondi.TRIGGER,
        payload: {
          params: shabondiEntity,
          options: { paperApi },
        },
      },
      b: {
        type: actions.deleteShabondi.TRIGGER,
        payload: {
          params: anotherShabondiEntity,
          options: { paperApi },
        },
      },
    });
    const output$ = deleteShabondiEpic(action$);

    expectObservable(output$).toBe(expected, {
      a: {
        type: actions.deleteShabondi.REQUEST,
        payload: {
          shabondiId,
        },
      },
      u: {
        type: actions.setSelectedCell.TRIGGER,
        payload: null,
      },
      v: {
        type: actions.deleteShabondi.SUCCESS,
        payload: {
          shabondiId,
        },
      },
      b: {
        type: actions.deleteShabondi.REQUEST,
        payload: {
          shabondiId: getId(anotherShabondiEntity),
        },
      },
      x: {
        type: actions.setSelectedCell.TRIGGER,
        payload: null,
      },
      y: {
        type: actions.deleteShabondi.SUCCESS,
        payload: {
          shabondiId: getId(anotherShabondiEntity),
        },
      },
    });

    expectSubscriptions(action$.subscriptions).toBe(subs);

    flush();
  });
});

it('delete same shabondi within period should be created once only', () => {
  makeTestScheduler().run(helpers => {
    const { hot, expectObservable, expectSubscriptions, flush } = helpers;

    const input = '   ^-aa 10s a----';
    const expected = '--a 999ms (uv)';
    const subs = '    ^-------------';

    const action$ = hot(input, {
      a: {
        type: actions.deleteShabondi.TRIGGER,
        payload: {
          params: shabondiEntity,
          options: { paperApi },
        },
      },
    });
    const output$ = deleteShabondiEpic(action$);

    expectObservable(output$).toBe(expected, {
      a: {
        type: actions.deleteShabondi.REQUEST,
        payload: {
          shabondiId,
        },
      },
      u: {
        type: actions.setSelectedCell.TRIGGER,
        payload: null,
      },
      v: {
        type: actions.deleteShabondi.SUCCESS,
        payload: {
          shabondiId,
        },
      },
    });

    expectSubscriptions(action$.subscriptions).toBe(subs);

    flush();
  });
});

it('throw exception of delete shabondi should also trigger event log action', () => {
  const error = {
    status: -1,
    data: {},
    title: 'mock delete shabondi failed',
  };
  const spyCreate = jest
    .spyOn(shabondiApi, 'remove')
    .mockReturnValueOnce(throwError(error));

  makeTestScheduler().run(helpers => {
    const { hot, expectObservable, expectSubscriptions, flush } = helpers;

    const input = '   ^-a-----|';
    const expected = '--(aeu)-|';
    const subs = '    ^-------!';

    const action$ = hot(input, {
      a: {
        type: actions.deleteShabondi.TRIGGER,
        payload: {
          params: shabondiEntity,
          options: { paperApi },
        },
      },
    });
    const output$ = deleteShabondiEpic(action$);

    expectObservable(output$).toBe(expected, {
      a: {
        type: actions.deleteShabondi.REQUEST,
        payload: { shabondiId },
      },
      e: {
        type: actions.deleteShabondi.FAILURE,
        payload: { ...error, shabondiId },
      },
      u: {
        type: actions.createEventLog.TRIGGER,
        payload: {
          ...error,
          shabondiId,
          type: LOG_LEVEL.error,
        },
      },
    });

    expectSubscriptions(action$.subscriptions).toBe(subs);

    flush();

    expect(spyCreate).toHaveBeenCalled();
  });
});
