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

import { throwError, zip } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { retryBackoff } from 'backoff-rxjs';
import { size, some } from 'lodash';
import { ObjectKey } from 'api/apiInterface/basicInterface';
import { SERVICE_STATE, ClusterData } from 'api/apiInterface/clusterInterface';
import * as brokerApi from 'api/brokerApi';
import { deferApi } from './internal/deferApi';
import { isServiceRunning } from './utils';

export function createBroker(values: any) {
  return deferApi(() => brokerApi.create(values)).pipe(map((res) => res.data));
}

export function fetchBroker(key: ObjectKey) {
  return deferApi(() => brokerApi.get(key)).pipe(map((res) => res.data));
}

export function startBroker(key: ObjectKey) {
  return zip(
    // attempt to start at intervals
    deferApi(() => brokerApi.start(key)),
    // wait until the service is running
    deferApi(() => brokerApi.get(key)).pipe(
      map((res) => {
        if (!isServiceRunning(res)) throw res;
        return res.data;
      }),
    ),
  ).pipe(
    map(([, data]) => data),
    // retry every 2 seconds, up to 10 times
    retryBackoff({
      initialInterval: 2000,
      maxRetries: 10,
      maxInterval: 2000,
    }),
    catchError((error) =>
      throwError({
        data: error?.data,
        meta: error?.meta,
        title:
          `Try to start broker: "${key.name}" failed after retry 10 times. ` +
          `Expected state: ${SERVICE_STATE.RUNNING}, Actual state: ${error.data.state}`,
      }),
    ),
  );
}

export function stopBroker(key: ObjectKey) {
  return zip(
    // attempt to stop at intervals
    deferApi(() => brokerApi.stop(key)),
    // wait until the service is not running
    deferApi(() => brokerApi.get(key)).pipe(
      map((res) => {
        if (isServiceRunning(res)) throw res;
        return res.data;
      }),
    ),
  ).pipe(
    map(([, data]) => data),
    // retry every 2 seconds, up to 10 times
    retryBackoff({
      initialInterval: 2000,
      maxRetries: 10,
      maxInterval: 2000,
    }),
    catchError((error) =>
      throwError({
        data: error?.data,
        meta: error?.meta,
        title:
          `Try to stop broker: "${key.name}" failed after retry 10 times. ` +
          `Expected state is nonexistent, Actual state: ${error.data.state}`,
      }),
    ),
  );
}

export function deleteBroker(key: ObjectKey) {
  return zip(
    // attempt to delete at intervals
    deferApi(() => brokerApi.remove(key)),
    // wait until the service does not exist
    deferApi(() => brokerApi.getAll({ group: key.group })).pipe(
      map((res) => {
        if (
          size(res.data) > 0 &&
          some(res.data, (cluster: ClusterData) => cluster.name === key.name)
        ) {
          throw res;
        }
        return res.data;
      }),
    ),
  ).pipe(
    // retry every 2 seconds, up to 10 times
    retryBackoff({
      initialInterval: 2000,
      maxRetries: 10,
      maxInterval: 2000,
    }),
    catchError((error) =>
      throwError({
        meta: error?.meta,
        title: 'delete broker exceeded max retry count',
      }),
    ),
  );
}
