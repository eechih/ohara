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

import * as context from 'context';
import * as util from './apiHelperUtils';
import { CELL_STATUS } from 'const';

const stream = () => {
  const {
    createStream,
    updateStream,
    startStream,
    stopStream,
    deleteStream,
  } = context.useStreamActions();

  const create = async (params, paperApi) => {
    const { id, name, className, jarKey } = params;
    const res = await createStream({
      name,
      connector__class: className,
      jarKey,
    });

    if (!res.error) {
      const state = util.getCellState(res);
      paperApi.updateElement(id, {
        status: state,
      });
    } else {
      paperApi.removeElement(id);
    }
  };

  const updateLinkTo = async (params, paperApi) => {
    const { stream, topic, link } = params;
    const res = await updateStream({
      name: stream.name,
      to: [{ name: topic.name }],
    });
    if (res.error) {
      paperApi.removeElement(link.id);
    }
    return res;
  };

  const updateLinkFrom = async (params, paperApi) => {
    const { stream, topic, link } = params;
    const res = await updateStream({
      name: stream.name,
      from: [{ name: topic.name }],
    });

    if (res.error) {
      paperApi.removeElement(link.id);
    }
    return res;
  };

  const start = async (params, paperApi) => {
    const { id, name } = params;
    paperApi.updateElement(id, {
      status: CELL_STATUS.pending,
    });
    const res = await startStream(name);
    if (!res.error) {
      const state = util.getCellState(res);
      paperApi.updateElement(id, {
        status: state,
      });
    } else {
      paperApi.updateElement(id, {
        status: CELL_STATUS.stopped,
      });
    }
  };

  const stop = async (params, paperApi) => {
    const { id, name } = params;
    const res = await stopStream(name);
    if (!res.error) {
      const state = util.getCellState(res);
      paperApi.updateElement(id, {
        status: state,
      });
    }
  };

  const remove = async (params, paperApi) => {
    const { id, name } = params;
    const res = await deleteStream(name);
    if (!res.error) {
      paperApi.removeElement(id);
    }
  };

  const removeLinkTo = async ({ name }) => {
    await updateStream({
      name,
      to: [],
    });
  };

  const removeLinkFrom = async ({ name }) => {
    await updateStream({
      name,
      from: [],
    });
  };

  return {
    create,
    updateLinkTo,
    updateLinkFrom,
    start,
    stop,
    remove,
    removeLinkTo,
    removeLinkFrom,
  };
};

export default stream;