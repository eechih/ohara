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

import {
  createContext,
  useReducer,
  useCallback,
  useEffect,
  useContext,
} from 'react';
import PropTypes from 'prop-types';
import { fetchConfiguratorCreator } from './configuratorActions';
import { reducer, initialState } from './configuratorReducer';
import * as hooks from 'hooks';

const ConfiguratorStateContext = createContext();
const ConfiguratorDispatchContext = createContext();

const ConfiguratorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const showMessage = hooks.useShowMessage();

  const fetchConfigurator = useCallback(
    () => fetchConfiguratorCreator(state, dispatch, showMessage),
    [state, dispatch, showMessage],
  );

  useEffect(() => {
    fetchConfigurator();
  }, [fetchConfigurator]);

  return (
    <ConfiguratorStateContext.Provider value={state}>
      <ConfiguratorDispatchContext.Provider value={dispatch}>
        {children}
      </ConfiguratorDispatchContext.Provider>
    </ConfiguratorStateContext.Provider>
  );
};

ConfiguratorProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const useConfiguratorState = () => {
  const context = useContext(ConfiguratorStateContext);
  if (context === undefined) {
    throw new Error(
      'useConfiguratorState must be used within a ConfiguratorProvider',
    );
  }
  return context;
};

export { ConfiguratorProvider, useConfiguratorState };
