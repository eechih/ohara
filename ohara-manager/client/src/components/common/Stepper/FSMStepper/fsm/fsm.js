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

import { EVENTS, STATES } from '../const';

export const fsm = {
  id: 'Workspace',

  context: {
    forward: true,
    activeIndex: 0,
  },

  initial: STATES.AUTO,
  states: {
    [STATES.AUTO]: {
      on: {
        [EVENTS.SUSPEND]: STATES.MANUAL,
      },
      invoke: {
        id: 'CallApi',
        src: 'callApi',
        onDone: [
          {
            target: [`#Workspace.${STATES.AUTO}`],
            actions: ['callApiSuccess'],
          },
        ],
        onError: [
          {
            target: [`#Workspace.${STATES.MANUAL}`],
            actions: ['callApiFailure'],
          },
        ],
      },
      entry: [
        context => {
          context.error = null;
        },
      ],
    },
    [STATES.MANUAL]: {
      on: {
        [EVENTS.ROLLBACK]: {
          target: STATES.AUTO,
          actions: [
            ctx => {
              ctx.forward = false;
            },
          ],
        },
        [EVENTS.FORWARD]: {
          target: STATES.AUTO,
          actions: [
            ctx => {
              ctx.forward = true;
            },
          ],
        },
        [EVENTS.RESUME]: STATES.AUTO,
        [EVENTS.RETRY]: STATES.AUTO,
        [EVENTS.NEXT]: {
          actions: ['next'],
        },
        [EVENTS.PREV]: { actions: ['prev'] },
      },
    },
    [STATES.FINISH]: {},
  },
};
