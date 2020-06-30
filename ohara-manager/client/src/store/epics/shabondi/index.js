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

import { combineEpics } from 'redux-observable';
import createShabondiEpic from './createShabondiEpic';
import startShabondiEpic from './startShabondiEpic';
import stopShabondiEpic from './stopShabondiEpic';
import stopShabondisEpic from './stopShabondisEpic';
import deleteShabondiEpic from './deleteShabondiEpic';
import deleteShabondisEpic from './deleteShabondisEpic';
import updateShabondiEpic from './updateShabondiEpic';
import updateLinkShabondiEpic from './updateLinkShabondiEpic';
import removeShabondiSourceLinkEpic from './removeShabondiSourceLinkEpic';
import removeShabondiSinkLinkEpic from './removeShabondiSinkLinkEpic';
import fetchShabondisEpic from './fetchShabondisEpic';

export default combineEpics(
  createShabondiEpic,
  deleteShabondiEpic,
  deleteShabondisEpic,
  fetchShabondisEpic,
  removeShabondiSourceLinkEpic,
  removeShabondiSinkLinkEpic,
  startShabondiEpic,
  stopShabondiEpic,
  stopShabondisEpic,
  updateShabondiEpic,
  updateLinkShabondiEpic,
);
