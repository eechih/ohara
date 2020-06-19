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
import StopIcon from '@material-ui/icons/Stop';
import RefreshIcon from '@material-ui/icons/Refresh';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

import ConfirmDialog from 'components/common/Dialog/DeleteDialog';

const Controller = (props) => {
  const { revertible, pauseable, state, send } = props;

  const isIdle = state.matches('idle');
  const isAuto = state.matches('auto');
  const isForward = !!state?.context?.forward;
  const hasError = !!state?.context?.error;

  const showRetryButton = isIdle && hasError;
  const showRevertButton = revertible && isIdle && hasError && isForward;
  const showPauseButton = pauseable && isAuto;
  const showResumeButton = pauseable && isIdle && !hasError;

  return (
    <>
      <Grid
        alignItems="center"
        container
        direction="row"
        justify="center"
        spacing={2}
      >
        {showRevertButton && (
          <Grid item>
            <Button
              color="primary"
              data-testid="stepper-revert-button"
              onClick={() => send('REVERT')}
              startIcon={<ArrowBackIcon />}
            >
              ROLLBACK
            </Button>
          </Grid>
        )}

        {showRetryButton && (
          <Grid item>
            <Button
              color="primary"
              data-testid="stepper-retry-button"
              onClick={() => send('RETRY')}
              startIcon={<RefreshIcon />}
            >
              RETRY
            </Button>
          </Grid>
        )}

        {showPauseButton && (
          <Grid item>
            <Button
              color="primary"
              data-testid="stepper-pause-button"
              onClick={() => send('PAUSE')}
              startIcon={<StopIcon />}
            >
              PAUSE
            </Button>
          </Grid>
        )}

        {showResumeButton && (
          <Grid item>
            <Button
              color="primary"
              data-testid="stepper-resume-button"
              onClick={() => send('RESUME')}
              startIcon={<PlayArrowIcon />}
            >
              RESUME
            </Button>
          </Grid>
        )}
      </Grid>
      <ConfirmDialog
        cancelText="Disagree"
        confirmText="Agree"
        content="Do you want to suspend?"
        isWorking={state.matches('auto.cancelling')}
        onClose={() => send('DISAGREE')}
        onConfirm={() => send('AGREE')}
        open={
          state.matches('auto.cancelConfirming') ||
          state.matches('auto.cancelling')
        }
        title="Do you want to suspend?"
      />
    </>
  );
};

Controller.propTypes = {
  state: PropTypes.shape({
    context: PropTypes.shape({
      activeStep: PropTypes.number,
      steps: PropTypes.array,
      forward: PropTypes.bool,
      error: PropTypes.object,
    }),
    matches: PropTypes.func,
  }).isRequired,
  pauseable: PropTypes.bool,
  revertible: PropTypes.bool,
  send: PropTypes.func.isRequired,
};

Controller.defaultProps = {
  pauseable: false,
  revertible: false,
};

export default Controller;
