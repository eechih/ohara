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

import { merge } from 'lodash';
import { normalize } from 'normalizr';
import { ofType } from 'redux-observable';
import { of, defer, iif, throwError, zip, from } from 'rxjs';
import {
  catchError,
  map,
  startWith,
  retryWhen,
  delay,
  concatMap,
  distinctUntilChanged,
  mergeMap,
} from 'rxjs/operators';

import * as streamApi from 'api/streamApi';
import { SERVICE_STATE } from 'api/apiInterface/clusterInterface';
import * as actions from 'store/actions';
import * as schema from 'store/schema';
import { getId } from 'utils/object';
import { CELL_STATUS, LOG_LEVEL } from 'const';

/* eslint-disable no-unused-expressions */
const startStream$ = (value) => {
  const { params, options = {} } = value;
  const streamId = getId(params);

  const previousStatus =
    options.paperApi?.getCell(params?.id)?.status || CELL_STATUS.stopped;

  options.paperApi?.updateElement(params.id, {
    status: CELL_STATUS.pending,
  });
  return zip(
    defer(() => streamApi.start(params)),
    defer(() => streamApi.get(params)).pipe(
      map((res) => {
        if (!res.data.state || res.data.state !== SERVICE_STATE.RUNNING)
          throw res;
        else return res.data;
      }),
    ),
  ).pipe(
    retryWhen((errors) =>
      errors.pipe(
        concatMap((value, index) =>
          iif(
            () => index > 4,
            throwError({
              data: value?.data,
              meta: value?.meta,
              title:
                `Try to start stream: "${params.name}" failed after retry ${index} times. ` +
                `Expected state: ${SERVICE_STATE.RUNNING}, Actual state: ${value.data.state}`,
            }),
            of(value).pipe(delay(2000)),
          ),
        ),
      ),
    ),
    map(([, data]) => normalize(data, schema.stream)),
    map((normalizedData) => merge(normalizedData, { streamId })),
    map((normalizedData) => {
      options.paperApi?.updateElement(params.id, {
        status: CELL_STATUS.running,
      });
      return actions.startStream.success(normalizedData);
    }),
    startWith(actions.startStream.request({ streamId })),
    catchError((err) => {
      options.paperApi?.updateElement(params.id, {
        status: err?.data?.state?.toLowerCase() ?? previousStatus,
      });
      return from([
        actions.startStream.failure(merge(err, { streamId })),
        actions.createEventLog.trigger({ ...err, type: LOG_LEVEL.error }),
      ]);
    }),
  );
};

export default (action$) =>
  action$.pipe(
    ofType(actions.startStream.TRIGGER),
    map((action) => action.payload),
    distinctUntilChanged(),
    mergeMap((value) => startStream$(value)),
  );
