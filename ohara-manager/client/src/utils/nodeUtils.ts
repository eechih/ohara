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

import { flatMap, filter, size, uniqWith, isEqual } from 'lodash';
import { KIND } from 'const';
import { Node, Key } from 'types';

export const getServiceCountOfNode = (node: Node): number => {
  const services = filter(
    node.services,
    (service) => service.name !== KIND.configurator,
  );
  const clusters = flatMap(services, (service) => service.clusterKeys);
  const count = size(clusters);
  return count;
};

export const getAllClusterKeys = (node: Node, unique = false): Key[] => {
  const keys = flatMap(node?.services, (service) => service.clusterKeys);
  return unique ? uniqWith(keys, isEqual) : keys;
};

export const getAllClusterKeysByWorkspaceName = (
  node: Node,
  workspaceName: string,
  unique = false,
): Key[] => {
  return getAllClusterKeys(node, unique).filter((key) => {
    return key.name === workspaceName;
  });
};
