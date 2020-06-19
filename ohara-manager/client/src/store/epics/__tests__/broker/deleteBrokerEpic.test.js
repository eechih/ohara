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

import { throwError, of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

import { LOG_LEVEL } from 'const';
import * as brokerApi from 'api/brokerApi';
import deleteBrokerEpic from '../../broker/deleteBrokerEpic';
import * as actions from 'store/actions';
import { getId } from 'utils/object';
import { entity as brokerEntity } from 'api/__mocks__/brokerApi';

jest.mock('api/brokerApi');

const bkId = getId(brokerEntity);

const makeTestScheduler = () =>
  new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });

it('delete broker should be worked correctly', () => {
  makeTestScheduler().run((helpers) => {
    const { hot, expectObservable, expectSubscriptions, flush } = helpers;

    const input = '   ^-a        ';
    const expected = '--a 999ms u';
    const subs = ['   ^----------', '--^ 999ms !'];

    const action$ = hot(input, {
      a: {
        type: actions.deleteBroker.TRIGGER,
        payload: { values: brokerEntity },
      },
    });
    const output$ = deleteBrokerEpic(action$);

    expectObservable(output$).toBe(expected, {
      a: {
        type: actions.deleteBroker.REQUEST,
        payload: {
          brokerId: bkId,
        },
      },
      u: {
        type: actions.deleteBroker.SUCCESS,
        payload: {
          brokerId: bkId,
        },
      },
    });

    expectSubscriptions(action$.subscriptions).toBe(subs);

    flush();
  });
});

it('delete multiple brokers should be worked correctly', () => {
  makeTestScheduler().run((helpers) => {
    const { hot, expectObservable, expectSubscriptions, flush } = helpers;

    const input = '   ^-ab         ';
    const expected = '--ab 998ms uv';
    const subs = ['   ^------------', '--^ 999ms !', '---^ 999ms !'];
    const anotherBrokerEntity = { ...brokerEntity, name: 'bk01' };

    const action$ = hot(input, {
      a: {
        type: actions.deleteBroker.TRIGGER,
        payload: { values: brokerEntity },
      },
      b: {
        type: actions.deleteBroker.TRIGGER,
        payload: { values: anotherBrokerEntity },
      },
    });
    const output$ = deleteBrokerEpic(action$);

    expectObservable(output$).toBe(expected, {
      a: {
        type: actions.deleteBroker.REQUEST,
        payload: {
          brokerId: bkId,
        },
      },
      u: {
        type: actions.deleteBroker.SUCCESS,
        payload: {
          brokerId: bkId,
        },
      },
      b: {
        type: actions.deleteBroker.REQUEST,
        payload: {
          brokerId: getId(anotherBrokerEntity),
        },
      },
      v: {
        type: actions.deleteBroker.SUCCESS,
        payload: {
          brokerId: getId(anotherBrokerEntity),
        },
      },
    });

    expectSubscriptions(action$.subscriptions).toBe(subs);

    flush();
  });
});

it('delete same broker within period should be deleted once only', () => {
  makeTestScheduler().run((helpers) => {
    const { hot, expectObservable, expectSubscriptions, flush } = helpers;

    const input = '   ^-aa 10s a---';
    const expected = '--a 999ms u--';
    const subs = ['   ^------------', '--^ 999ms !'];

    const action$ = hot(input, {
      a: {
        type: actions.deleteBroker.TRIGGER,
        payload: { values: brokerEntity },
      },
    });
    const output$ = deleteBrokerEpic(action$);

    expectObservable(output$).toBe(expected, {
      a: {
        type: actions.deleteBroker.REQUEST,
        payload: {
          brokerId: bkId,
        },
      },
      u: {
        type: actions.deleteBroker.SUCCESS,
        payload: {
          brokerId: bkId,
        },
      },
    });

    expectSubscriptions(action$.subscriptions).toBe(subs);

    flush();
  });
});

it('throw exception of delete broker should also trigger event log action', () => {
  const error = {
    meta: undefined,
    title: `delete broker exceeded max retry count`,
  };
  const spyGetAll = jest.spyOn(brokerApi, 'getAll').mockReturnValue(
    of({
      status: 200,
      title: 'mock get all broker data',
      data: [brokerEntity],
    }),
  );

  makeTestScheduler().run((helpers) => {
    const { hot, expectObservable, expectSubscriptions, flush } = helpers;

    const input = '   ^-a             ';
    const expected = '--a 19999ms (eu)';
    const subs = ['   ^---------------', '--^ 19999ms !'];

    const action$ = hot(input, {
      a: {
        type: actions.deleteBroker.TRIGGER,
        payload: { values: brokerEntity },
      },
    });
    const output$ = deleteBrokerEpic(action$);

    expectObservable(output$).toBe(expected, {
      a: {
        type: actions.deleteBroker.REQUEST,
        payload: { brokerId: bkId },
      },
      e: {
        type: actions.deleteBroker.FAILURE,
        payload: { ...error, brokerId: bkId },
      },
      u: {
        type: actions.createEventLog.TRIGGER,
        payload: {
          ...error,
          brokerId: bkId,
          type: LOG_LEVEL.error,
        },
      },
    });

    expectSubscriptions(action$.subscriptions).toBe(subs);

    flush();

    expect(spyGetAll).toHaveBeenCalled();
  });
});
