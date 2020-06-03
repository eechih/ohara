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
import { capitalize } from 'lodash';

import MuiStepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';

const Stepper = props => {
  const { state } = props;

  console.log(state);

  return (
    <MuiStepper activeStep={state.context.activeIndex} alternativeLabel>
      {state.context.activities.map((activity, index) => {
        const stepProps = {};
        const labelProps = {};
        if (state.context.error && index === state.context.activeIndex) {
          stepProps.completed = false;
          labelProps.error = true;
        }
        return (
          <Step key={`${activity.name}.${activity.action}`} {...stepProps}>
            <StepLabel {...labelProps}>
              {capitalize(activity.action)} {capitalize(activity.name)}
            </StepLabel>
          </Step>
        );
      })}
    </MuiStepper>
  );
};

Stepper.propTypes = {
  state: PropTypes.shape({
    context: PropTypes.shape({
      activeIndex: PropTypes.number,
      activities: PropTypes.array,
      error: PropTypes.object,
    }),
    matches: PropTypes.func,
  }).isRequired,
  send: PropTypes.func,
};

export default Stepper;
