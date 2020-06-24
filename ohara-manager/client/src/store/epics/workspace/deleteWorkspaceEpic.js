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
import { ofType } from 'redux-observable';
import { from } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  map,
  mergeMap,
  startWith,
  takeUntil,
} from 'rxjs/operators';

import { LOG_LEVEL } from 'const';
import { deleteWorkspace } from 'observables';
import * as actions from 'store/actions';
import { getId } from 'utils/object';

export default (action$) =>
  action$.pipe(
    ofType(actions.deleteWorkspace.TRIGGER),
    map((action) => action.payload),
    distinctUntilChanged(),
    mergeMap(({ values, options, resolve, reject }) => {
      const workspaceId = getId(values);
      return deleteWorkspace(values).pipe(
        mergeMap(() => {
          if (resolve) resolve();

          const input = [
            actions.deleteWorkspace.success({ workspaceId }),
            actions.switchWorkspace(),
            actions.fetchNodes(),
          ];

          if (options?.showLog) {
            input.push(
              actions.createEventLog.trigger({
                title: `Successfully deleted workspace ${values.name}.`,
                type: LOG_LEVEL.info,
              }),
            );
          }

          return from(input);
        }),
        startWith(actions.deleteWorkspace.request({ workspaceId })),
        catchError((err) => {
          if (reject) reject(err);
          return from([
            actions.deleteWorkspace.failure(merge(err, { workspaceId })),
            actions.createEventLog.trigger({ ...err, type: LOG_LEVEL.error }),
          ]);
        }),
        takeUntil(action$.pipe(ofType(actions.deleteWorkspace.CANCEL))),
      );
    }),
  );
