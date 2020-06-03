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

import React from 'react';
import PropTypes from 'prop-types';
import { useMachine } from '@xstate/react';
import Container from '@material-ui/core/Container';

import Stepper from './Stepper';
import Controller from './Controller';
import LogViewer from './LogViewer';
import machine from './fsm';

const FSMStepper = props => {
  const { activities, onClose } = props;
  const [state, send] = useMachine(
    machine.withContext({ forward: true, activeIndex: 0, activities }),
  );

  return (
    <Container maxWidth="md">
      <Stepper state={state} send={send} onClose={onClose} />
      <Controller state={state} send={send} onClose={onClose} />
      <LogViewer isOpen={true} />
    </Container>
  );
};

FSMStepper.propTypes = {
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      action: PropTypes.string,
    }),
  ).isRequired,
  onClose: PropTypes.func,
};

FSMStepper.defaultProps = {
  onClose: () => {},
};

export default FSMStepper;
