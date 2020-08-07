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
import {
  distinctUntilChanged,
  map,
  mergeMap,
  startWith,
  tap,
  takeUntil,
} from 'rxjs/operators';

import { fetchAndDeleteConnectors } from 'observables';
import { getId } from 'utils/object';
import * as actions from 'store/actions';
import { catchErrorWithEventLog } from '../utils';

export default (action$) =>
  action$.pipe(
    ofType(actions.deleteConnectors.TRIGGER),
    map((action) => action.payload),
    distinctUntilChanged(),
    mergeMap(({ values, resolve, reject }) => {
      const { workspaceKey } = values;
      return fetchAndDeleteConnectors(workspaceKey).pipe(
        tap((connectors) => {
          if (resolve) resolve(connectors);
          return connectors;
        }),
        map((connectors) =>
          actions.deleteConnectors.success(connectors.map(getId)),
        ),
        startWith(actions.deleteConnectors.request()),
        catchErrorWithEventLog((err) => {
          if (reject) reject(err);
          return actions.deleteConnectors.failure(merge(err));
        }),
        takeUntil(action$.pipe(ofType(actions.deleteConnectors.CANCEL))),
      );
    }),
  );
