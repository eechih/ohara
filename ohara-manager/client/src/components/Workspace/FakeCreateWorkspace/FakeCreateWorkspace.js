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

import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import RenderCount from 'components/common/RenderCount';
import { FSMStepper } from 'components/common/Stepper';

export const ACTIVITIES = {
  BROKER: {
    DELETE: {
      name: 'broker',
      action: 'delete',
    },
    STOP: {
      name: 'broker',
      action: 'stop',
    },
  },
  WORKER: {
    DELETE: {
      name: 'worker',
      action: 'delete',
    },
    STOP: {
      name: 'worker',
      action: 'stop',
    },
  },
  ZOOKEEPER: {
    DELETE: {
      name: 'zookeeper',
      action: 'delete',
    },
    STOP: {
      name: 'zookeeper',
      action: 'stop',
    },
  },
};

const FakeCreateWorkspace = props => {
  const { isOpen, onClose } = props;
  const [agreed, setAgreed] = useState(false);
  const activities = [
    ACTIVITIES.WORKER.STOP,
    ACTIVITIES.BROKER.STOP,
    ACTIVITIES.ZOOKEEPER.STOP,
    ACTIVITIES.WORKER.DELETE,
    ACTIVITIES.BROKER.DELETE,
    ACTIVITIES.ZOOKEEPER.DELETE,
  ];

  const handleClose = () => {
    onClose();
    setTimeout(() => setAgreed(false), 500);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth={'md'}
      fullWidth={agreed}
    >
      <RenderCount />
      <DialogTitle id="alert-dialog-title">{'Create Workspace'}</DialogTitle>
      {!agreed && (
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you like to create a new workspace?
          </DialogContentText>
        </DialogContent>
      )}
      {!agreed && (
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Disagree
          </Button>
          <Button onClick={() => setAgreed(true)} color="primary" autoFocus>
            Agree
          </Button>
        </DialogActions>
      )}
      {agreed && <FSMStepper activities={activities} />}
    </Dialog>
  );
};

FakeCreateWorkspace.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

FakeCreateWorkspace.defaultProps = {
  onClose: () => {},
};

export default FakeCreateWorkspace;
