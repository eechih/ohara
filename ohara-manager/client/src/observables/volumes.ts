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

/* eslint-disable no-throw-literal */
import { defer, of } from 'rxjs';
import { map, concatAll, last, tap, mapTo } from 'rxjs/operators';
import { retryBackoff } from 'backoff-rxjs';
import { ObjectKey } from 'api/apiInterface/basicInterface';
import { VolumeResponse } from 'api/apiInterface/volumeInterface';
import * as volumeApi from 'api/volumeApi';
import { RETRY_STRATEGY } from 'const';
import { isServiceStarted, isServiceStopped } from './utils';
import { serviceName as randomServiceName } from 'utils/generate';

export function createVolume(values: any) {
  return defer(() => volumeApi.create(values)).pipe(map((res) => res.data));
}

export function fetchVolume(values: ObjectKey) {
  return defer(() => volumeApi.get(values)).pipe(map((res) => res.data));
}

export function startVolume(key: ObjectKey) {
  // try to start until the volume starts successfully
  return of(
    defer(() => volumeApi.start(key)),
    defer(() => volumeApi.get(key)).pipe(
      tap((res: VolumeResponse) => {
        if (!isServiceStarted(res.data)) {
          throw {
            ...res,
            title: `Failed to start volume ${key.name}: Unable to confirm the status of the volume is running`,
          };
        }
      }),
      retryBackoff(RETRY_STRATEGY),
    ),
  ).pipe(
    concatAll(),
    last(),
    map((res) => res.data),
  );
}

export function stopVolume(key: ObjectKey) {
  // try to stop until the volume really stops
  return of(
    defer(() => volumeApi.stop(key)),
    defer(() => volumeApi.get(key)).pipe(
      tap((res: VolumeResponse) => {
        if (!isServiceStopped(res.data)) {
          throw {
            ...res,
            title: `Failed to stop volume ${key.name}: Unable to confirm the status of the volume is not running`,
          };
        }
      }),
      retryBackoff(RETRY_STRATEGY),
    ),
  ).pipe(
    concatAll(),
    last(),
    map((res) => res.data),
  );
}

export function deleteVolume(key: ObjectKey) {
  return defer(() => volumeApi.remove(key));
}

export function validateVolumePath(
  path: string,
  nodeNames: string[],
): Promise<boolean> {
  const dummyVolumeKey = {
    group: 'default',
    name: randomServiceName(),
  };
  const dummyVolume = { ...dummyVolumeKey, path, nodeNames };
  return of(
    defer(() => createVolume(dummyVolume)),
    defer(() => startVolume(dummyVolumeKey)),
    defer(() => stopVolume(dummyVolumeKey)),
    defer(() => deleteVolume(dummyVolumeKey)),
  )
    .pipe(concatAll(), last(), mapTo(true))
    .toPromise();
}
