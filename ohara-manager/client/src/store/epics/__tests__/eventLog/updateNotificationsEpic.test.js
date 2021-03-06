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

import { TestScheduler } from 'rxjs/testing';
import { StateObservable } from 'redux-observable';

import updateNotificationsEpic from '../../eventLog/updateNotificationsEpic';
import * as actions from 'store/actions';
import { LOG_LEVEL } from 'const';

const makeTestScheduler = () =>
  new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });

beforeEach(() => {
  jest.restoreAllMocks();
});

it('update notification should be executed correctly', () => {
  const stateValues = {
    entities: {
      eventLogs: {
        notifications: {
          data: {
            info: 10,
            error: 6,
          },
        },
        settings: {
          data: {
            limit: 10,
            unlimited: false,
          },
        },
      },
    },
  };

  makeTestScheduler().run(helpers => {
    const { hot, expectObservable, expectSubscriptions, flush } = helpers;

    const input = '   ^-ab--|';
    const expected = '--ab--|';
    const subs = '    ^-----!';

    const state$ = new StateObservable(hot('v', { v: stateValues }));
    const action$ = hot(input, {
      a: {
        type: actions.createEventLog.SUCCESS,
        payload: {
          type: LOG_LEVEL.info,
        },
      },
      b: {
        type: actions.createEventLog.SUCCESS,
        payload: {
          type: LOG_LEVEL.error,
        },
      },
    });
    const output$ = updateNotificationsEpic(action$, state$);

    const infoValues = Object.assign(
      {},
      stateValues.entities.eventLogs.notifications.data,
    );
    // although the "info" count should be increment
    // but the "limit" will restrict the result
    infoValues.info = stateValues.entities.eventLogs.settings.data.limit;

    const errValues = Object.assign({}, infoValues);
    // "error" count was small than "limit"
    // will be incremented
    errValues.error++;
    expectObservable(output$).toBe(expected, {
      a: {
        type: actions.updateNotifications.SUCCESS,
        payload: infoValues,
      },
      b: {
        type: actions.updateNotifications.SUCCESS,
        payload: errValues,
      },
    });

    expectSubscriptions(action$.subscriptions).toBe(subs);

    flush();
  });
});
