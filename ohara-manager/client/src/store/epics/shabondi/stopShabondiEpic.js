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
import { of, defer, throwError, iif, zip, from } from 'rxjs';
import {
  catchError,
  map,
  retryWhen,
  delay,
  concatMap,
  startWith,
  distinctUntilChanged,
  mergeMap,
} from 'rxjs/operators';

import * as shabondiApi from 'api/shabondiApi';
import * as actions from 'store/actions';
import * as schema from 'store/schema';
import { getId } from 'utils/object';
import { CELL_STATUS, LOG_LEVEL } from 'const';

const stopShabondi$ = value => {
  const { params, options } = value;
  const { paperApi } = options;
  const shabondiId = getId(params);
  paperApi.updateElement(params.id, {
    status: CELL_STATUS.pending,
  });
  return zip(
    defer(() => shabondiApi.stop(params)),
    defer(() => shabondiApi.get(params)).pipe(
      map(res => {
        if (res.data.state) throw res;
        else return res.data;
      }),
      retryWhen(errors =>
        errors.pipe(
          concatMap((value, index) =>
            iif(
              () => index > 4,
              throwError({ title: 'stop shabondi exceeded max retry count' }),
              of(value).pipe(delay(2000)),
            ),
          ),
        ),
      ),
    ),
  ).pipe(
    map(([, data]) => normalize(data, schema.shabondi)),
    map(normalizedData => merge(normalizedData, { shabondiId })),
    map(normalizedData => {
      paperApi.updateElement(params.id, {
        status: CELL_STATUS.stopped,
      });
      return actions.stopShabondi.success(normalizedData);
    }),
    startWith(actions.stopShabondi.request({ shabondiId })),
    catchError(err => {
      options.paperApi.updateElement(params.id, {
        status: CELL_STATUS.failed,
      });
      return from([
        actions.stopShabondi.failure(merge(err, { shabondiId })),
        actions.createEventLog.trigger({ ...err, type: LOG_LEVEL.error }),
      ]);
    }),
  );
};

export default action$ =>
  action$.pipe(
    ofType(actions.stopShabondi.TRIGGER),
    map(action => action.payload),
    distinctUntilChanged(),
    mergeMap(value => stopShabondi$(value)),
  );
