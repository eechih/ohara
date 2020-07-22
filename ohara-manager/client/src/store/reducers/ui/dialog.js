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

const initialState = {
  isOpen: false,
  data: null,
};

function dialog(state = initialState, action) {
  switch (action.type) {
    case actions.openDialog.TRIGGER:
      return {
        ...state,
        isOpen: true,
        data: action.payload,
      };
    case actions.openDialog.FULFILL:
      return {
        ...state,
        isOpen: false,
        data: action.payload || null,
      };

    default:
      return state;
  }
}

export default function reducer(state = {}, action) {
  const { name, type } = action;
  if (
    name &&
    (type === actions.openDialog.TRIGGER || type === actions.openDialog.FULFILL)
  ) {
    return {
      ...state,
      [name]: dialog(state[name], action),
    };
  }
  return state;
}
