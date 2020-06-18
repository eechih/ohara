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

import { defer, from, iif, of, throwError, zip } from 'rxjs';
import {
  catchError,
  concatMap,
  delay,
  distinctUntilChanged,
  map,
  mergeMap,
  retryWhen,
  startWith,
  takeUntil,
} from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { normalize } from 'normalizr';
import { merge } from 'lodash';

import { SERVICE_STATE } from 'api/apiInterface/clusterInterface';
import * as workerApi from 'api/workerApi';
import { LOG_LEVEL } from 'const';
import { startWorker } from 'observables';
import * as actions from 'store/actions';
import * as schema from 'store/schema';
import { getId } from 'utils/object';

// Note: The caller SHOULD handle the error of this action
export const startWorker$ = (params) => {
  const workerId = getId(params);
  return zip(
    defer(() => workerApi.start(params)),
    defer(() => workerApi.get(params)).pipe(
      map((res) => {
        if (!res.data?.state || res.data.state !== SERVICE_STATE.RUNNING)
          throw res;
        else return res.data;
      }),
    ),
  ).pipe(
    retryWhen((errors) =>
      errors.pipe(
        concatMap((value, index) =>
          iif(
            () => index > 10,
            throwError({
              data: value?.data,
              meta: value?.meta,
              title:
                `Try to start worker: "${params.name}" failed after retry ${index} times. ` +
                `Expected state: ${SERVICE_STATE.RUNNING}, Actual state: ${value.data.state}`,
            }),
            of(value).pipe(delay(2000)),
          ),
        ),
      ),
    ),
    map(([, data]) => normalize(data, schema.worker)),
    map((normalizedData) => merge(normalizedData, { workerId })),
    map((normalizedData) => actions.startWorker.success(normalizedData)),
    startWith(actions.startWorker.request({ workerId })),
  );
};

export default (action$) =>
  action$.pipe(
    ofType(actions.startWorker.TRIGGER),
    map((action) => action.payload),
    distinctUntilChanged(),
    mergeMap(({ values, resolve, reject }) => {
      const workerId = getId(values);
      return startWorker(values).pipe(
        map((data) => {
          if (resolve) resolve(data);
          const normalizedData = merge(normalize(data, schema.worker), {
            workerId,
          });
          return actions.startWorker.success(normalizedData);
        }),
        startWith(actions.startWorker.request({ workerId })),
        catchError((err) => {
          if (reject) reject(err);
          return from([
            actions.startWorker.failure(
              merge(err, { workerId: getId(values) }),
            ),
            actions.createEventLog.trigger({ ...err, type: LOG_LEVEL.error }),
          ]);
        }),
        takeUntil(action$.pipe(ofType(actions.startWorker.CANCEL))),
      );
    }),
  );
