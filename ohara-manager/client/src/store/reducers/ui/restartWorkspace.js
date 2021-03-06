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

import * as actions from 'store/actions';
import { ACTIONS } from 'const';

const defaultSteps = [
  'Stop Worker',
  'Stop Broker',
  'Stop Zookeeper',
  'Start Zookeeper',
  'Start Broker',
  'Start Worker',
];

const initialState = {
  isOpen: false,
  loading: false,
  isAutoClose: false,
  closeDisable: true,
  progress: {
    open: false,
    steps: defaultSteps,
    activeStep: 0,
    log: [],
    message: 'Start RestartWorkspace... (0% complete)',
    isPause: false,
  },
  skipList: [],
  lastUpdated: null,
  error: null,
};

export default function reducer(state = initialState, action) {
  const now = new Date(Date.now()).toLocaleString();
  switch (action.type) {
    case actions.openRestartWorkspace.TRIGGER:
      return {
        ...state,
        isOpen: true,
      };
    case actions.closeRestartWorkspace.TRIGGER:
      return {
        ...state,
        isOpen: false,
        progress: {
          ...state.progress,
          message: '',
          log: [],
        },
      };
    case actions.pauseRestartWorkspace.TRIGGER:
      return {
        ...state,
        progress: {
          ...state.progress,
          isPause: true,
          log: [
            ...state.progress.log,
            { title: `${now} Pause Restart workspace...` },
          ],
        },
      };
    case actions.resumeRestartWorkspace.TRIGGER:
      return {
        ...state,
        progress: {
          ...state.progress,
          isPause: true,
          log: [
            ...state.progress.log,
            { title: `${now} Resume Restart workspace...` },
          ],
        },
      };
    case actions.rollbackRestartWorkspace.TRIGGER:
      return {
        ...state,
        progress: {
          ...state.progress,
          log: [
            ...state.progress.log,
            { title: `${now} Rollback Restart workspace...` },
          ],
        },
      };
    case actions.autoCloseRestartWorkspace.TRIGGER:
      const isAuto = state.isAutoClose ? false : true;
      return {
        ...state,
        isAutoClose: isAuto,
      };
    case actions.updateZookeeper.REQUEST:
      return {
        ...state,
        skipList: [...state.skipList, ACTIONS.STOP_ZOOKEEPER],
        progress: {
          ...state.progress,
          message: 'Update zookeeper... (43% complete)',
          log: [...state.progress.log, { title: `${now} Update zookeeper...` }],
        },
      };
    case actions.startZookeeper.REQUEST:
      return {
        ...state,
        skipList: [...state.skipList, ACTIONS.START_ZOOKEEPER],
        progress: {
          ...state.progress,
          message: 'Wait start zookeeper... (52% complete)',
          log: [
            ...state.progress.log,
            { title: `${now} Wait to start zookeeper...` },
          ],
        },
      };
    case actions.startZookeeper.SUCCESS:
      return {
        ...state,
        progress: {
          ...state.progress,
          activeStep: 4,
          message: 'Start zookeeper success... (59% complete)',
          log: [
            ...state.progress.log,
            { title: `${now} Start zookeeper success...` },
          ],
        },
      };
    case actions.updateBroker.REQUEST:
      return {
        ...state,
        skipList: [...state.skipList, ACTIONS.STOP_BROKER],
        progress: {
          ...state.progress,
          message: 'Update broker... (29% complete)',
          log: [...state.progress.log, { title: `${now} Update broker...` }],
        },
      };
    case actions.startBroker.REQUEST:
      return {
        ...state,
        skipList: [...state.skipList, ACTIONS.START_BROKER],
        progress: {
          ...state.progress,
          message: 'Wait start broker... (66% complete)',
          log: [
            ...state.progress.log,
            { title: `${now} Wait to start broker...` },
          ],
        },
      };
    case actions.startBroker.SUCCESS:
      return {
        ...state,
        progress: {
          ...state.progress,
          activeStep: 5,
          message: 'Start broker success... (73% complete)',
          log: [
            ...state.progress.log,
            { title: `${now} Start broker success...` },
          ],
        },
      };
    case actions.updateWorker.REQUEST:
      return {
        ...state,
        skipList: [...state.skipList, ACTIONS.STOP_WORKER],
        progress: {
          ...state.progress,
          message: 'Update worker... (15% complete)',
          log: [...state.progress.log, { title: `${now} Update worker...` }],
        },
      };
    case actions.startWorker.REQUEST:
      return {
        ...state,
        activeStep: 6,
        skipList: [...state.skipList, ACTIONS.START_WORKER],
        progress: {
          ...state.progress,
          message: 'Wait start worker... (80% complete)',
          log: [
            ...state.progress.log,
            { title: `${now} Wait to start worker...` },
          ],
        },
      };
    case actions.startWorker.SUCCESS:
      return {
        ...state,
        progress: {
          ...state.progress,
          activeStep: 6,
          message: 'Start worker success... (87% complete)',
          log: [
            ...state.progress.log,
            { title: `${now} Start worker success...` },
          ],
        },
      };
    case actions.stopWorker.REQUEST:
      return {
        ...state,
        skipList: [...state.skipList, ACTIONS.STOP_WORKER],
        progress: {
          ...state.progress,
          message: 'Wait stop worker... (7% complete)',
          log: [
            ...state.progress.log,
            { title: `${now} Start to stop worker...` },
          ],
        },
      };

    case actions.stopWorker.SUCCESS:
      return {
        ...state,
        progress: {
          ...state.progress,
          activeStep: 1,
          message: 'Stop worker success... (14% complete)',
          log: [
            ...state.progress.log,
            { title: `${now} Stop worker success...` },
          ],
        },
      };

    case actions.stopBroker.REQUEST:
      return {
        ...state,
        skipList: [...state.skipList, ACTIONS.STOP_BROKER],
        progress: {
          ...state.progress,
          message: 'Wait stop broker... (21% complete)',
          log: [
            ...state.progress.log,
            { title: `${now} Start to stop broker...` },
          ],
        },
      };

    case actions.stopBroker.SUCCESS:
      return {
        ...state,
        progress: {
          ...state.progress,
          activeStep: 2,
          message: 'Stop broker success... (28% complete)',
          log: [
            ...state.progress.log,
            { title: `${now} Stop broker success...` },
          ],
        },
      };

    case actions.stopZookeeper.REQUEST:
      return {
        ...state,
        skipList: [...state.skipList, ACTIONS.STOP_ZOOKEEPER],
        progress: {
          ...state.progress,
          message: 'Wait stop zookeeper... (35% complete)',
          log: [
            ...state.progress.log,
            {
              title: `${now} Start to stop zookeeper...`,
            },
          ],
        },
      };

    case actions.stopZookeeper.SUCCESS:
      return {
        ...state,
        progress: {
          ...state.progress,
          activeStep: 3,
          message: 'Stop zookeeper success... (42% complete)',
          log: [
            ...state.progress.log,
            {
              title: `${now} Stop zookeeper success...`,
            },
          ],
        },
      };
    case actions.updateWorkspace.SUCCESS:
      return {
        ...state,
        closeDisable: false,
        progress: {
          ...state.progress,
          activeStep: 7,
          message: 'Restart workspace success... (100% complete)',
        },
      };
    default:
      return state;
  }
}
