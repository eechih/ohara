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

import { ClusterData } from 'api/apiInterface/clusterInterface';
import {
  NodeData,
  Resource as Resource0,
} from 'api/apiInterface/nodeInterface';
import { ObjectKey } from 'api/apiInterface/basicInterface';
import { VolumeData } from 'api/apiInterface/volumeInterface';

export type Key = ObjectKey;
export type Object = Record<string, any>;
export type Workspace = Record<string, any>;
export type Broker = ClusterData;
export type Worker = ClusterData;
export type Zookeeper = ClusterData;
export type Stream = ClusterData;
export type Shabondi = ClusterData;
export type Node = NodeData;
export type Resource = Resource0;
export type Volume = VolumeData;
