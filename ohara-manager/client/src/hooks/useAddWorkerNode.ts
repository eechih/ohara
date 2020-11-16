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

import { queryCache, useMutation, MutationResultPair } from 'react-query';
import { addNode } from 'api/workerApi';
import { KIND } from 'const';

function addWorkerNode(
  variables: Record<string, any>,
): Promise<Record<string, any>> {
  const { name, nodeName } = variables;
  return addNode(
    {
      name,
      group: KIND.worker,
    },
    nodeName,
  );
}

export default function useAddWorkerNode(): MutationResultPair<
  Record<string, any>,
  Error,
  Record<string, any>,
  null
> {
  return useMutation(addWorkerNode, {
    onSuccess: async (worker) => {
      await queryCache.invalidateQueries([
        'worker',
        { name: worker.name, group: worker.group },
      ]);
    },
  });
}
