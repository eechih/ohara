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

import { omit } from 'lodash';
import { RESOURCE, API, COMMAND } from 'api/utils/apiUtils';
import {
  ServiceBody,
  ClusterResponse,
  ClusterResponseList,
} from './apiInterface/clusterInterface';
import { ObjectKey, BasicResponse } from './apiInterface/basicInterface';

const zookeeperApi = new API(RESOURCE.ZOOKEEPER);

export const create = (params: ServiceBody) => {
  return zookeeperApi.post<ClusterResponse>({
    name: params.name,
    body: params,
  });
};

export const update = (params: ServiceBody) => {
  return zookeeperApi.put<ClusterResponse>({
    name: params.name,
    group: params.group,
    body: omit(params, ['name', 'group']),
  });
};

export const remove = (objectKey: ObjectKey) => {
  return zookeeperApi.delete<BasicResponse>(objectKey);
};

export const get = (objectKey: ObjectKey) => {
  return zookeeperApi.get<ClusterResponse>({
    name: objectKey.name,
    queryParams: { group: objectKey.group },
  });
};

export const getAll = (queryParams?: object) => {
  return zookeeperApi.get<ClusterResponseList>({ queryParams });
};

export const start = (objectKey: ObjectKey) => {
  return zookeeperApi.execute<BasicResponse>({
    objectKey,
    action: COMMAND.START,
  });
};

export const stop = (objectKey: ObjectKey) => {
  return zookeeperApi.execute<BasicResponse>({
    objectKey,
    action: COMMAND.STOP,
  });
};

export const forceStop = (objectKey: ObjectKey) => {
  return zookeeperApi.execute<BasicResponse>({
    objectKey,
    action: COMMAND.STOP,
    queryParams: { force: true },
  });
};
