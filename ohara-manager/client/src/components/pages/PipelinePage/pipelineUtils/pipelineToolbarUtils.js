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

import { get, isObject } from 'lodash';

import * as connectorApi from 'api/connectorApi';
import { CONNECTOR_TYPES } from 'constants/pipelines';
import { isSource, isSink, isTopic, isStream } from './commonUtils';

const getClassName = connector => {
  let className = '';

  if (isObject(connector)) {
    // TODO: figure out a better way to get topic class name
    className = connector.className || 'topic';
  } else {
    className = connector;
  }

  return className;
};

export const createConnector = async ({ updateGraph, connector }) => {
  const { typeName } = connector;

  const className = getClassName(connector);
  let connectorName = `Untitled ${typeName}`;

  let id;

  if (isTopic(typeName)) {
    // Topic was created beforehand, it already has an ID.
    id = connector.id;
    connectorName = connector.name;
  } else if (isStream(typeName)) {
    id = connector.id;
  } else if (isSource(typeName) || isSink(typeName)) {
    if (Object.values(CONNECTOR_TYPES).includes(className)) {
      // Use the old API
      const params = {
        name: connectorName,
        'connector.name': connectorName,
        className: className,
        schema: [],
        topics: [],
        numberOfTasks: 1,
        configs: {},
      };

      const res = await connectorApi.createConnector(params);
      id = get(res, 'data.result.id', null);
    } else {
      // Use new API
      const params = {
        name: connectorName,
        'connector.class': className,
        'connector.name': connectorName,
      };

      const res = await connectorApi.createConnector(params);
      id = get(res, 'data.result.id', null);
    }
  }

  const update = {
    name: connectorName,
    kind: typeName,
    to: [],
    className,
    id,
  };

  updateGraph({ update });
};

export const trimString = string => {
  // Only displays the first 8 digits of the git sha instead so
  // it won't break our layout
  return string.substring(0, 7);
};
