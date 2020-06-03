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

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import StopIcon from '@material-ui/icons/Stop';
import ReplayIcon from '@material-ui/icons/Replay';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

import { EVENTS, STATES } from './const';

const Controller = props => {
  const { state, send } = props;

  const auto = state.matches(STATES.AUTO);
  const manual = state.matches(STATES.MANUAL);
  const forward = state.context.forward;
  const rollback = !forward;
  const error = state.context.error;

  return (
    <Grid
      container
      direction="row"
      justify="center"
      alignItems="center"
      spacing={2}
    >
      <Grid item>
        <Button
          color="primary"
          disabled={auto || rollback}
          onClick={() => send(EVENTS.ROLLBACK)}
          startIcon={<ArrowBackIcon />}
        >
          ROLLBACK
        </Button>
      </Grid>

      <Grid item>
        <Button
          color="primary"
          disabled={manual}
          onClick={() => send(EVENTS.SUSPEND)}
          startIcon={<StopIcon />}
        >
          SUSPEND
        </Button>
      </Grid>

      <Grid item>
        {!error && (
          <Button
            color="primary"
            disabled={auto}
            onClick={() => send(EVENTS.RESUME)}
            startIcon={<PlayArrowIcon />}
          >
            RESUME
          </Button>
        )}
        {error && (
          <Button
            color="primary"
            disabled={auto}
            onClick={() => send(EVENTS.RETRY)}
            startIcon={<ReplayIcon />}
          >
            RETRY
          </Button>
        )}
      </Grid>

      <Grid item>
        <Button
          color="primary"
          disabled={auto || forward}
          onClick={() => send(EVENTS.FORWARD)}
          startIcon={<ArrowForwardIcon />}
        >
          FORWARD
        </Button>
      </Grid>
    </Grid>
  );
};

Controller.propTypes = {
  state: PropTypes.shape({
    context: PropTypes.shape({
      activeIndex: PropTypes.number,
      activities: PropTypes.array,
      error: PropTypes.object,
      forward: PropTypes.bool,
    }),
    matches: PropTypes.func,
  }).isRequired,
  send: PropTypes.func,
};

export default Controller;
