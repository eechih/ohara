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
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';

import Stepper from 'components/common/FSMStepper';
import * as hooks from 'hooks';
import { getKey } from 'utils/object';

const DeleteWorkspace = (props) => {
  const { isOpen, onClose } = props;
  const workspace = hooks.useWorkspace();
  const workspaceKey = getKey(workspace);

  const stopBroker = hooks.useStopBrokerAction();
  const stopTopics = hooks.useStopTopicsAction();
  const stopWorker = hooks.useStopWorkerAction();
  const stopZookeeper = hooks.useStopZookeeperAction();

  const deleteBroker = hooks.useDeleteBrokerAction();
  const deleteConnectors = hooks.useDeleteConnectorsAction();
  const deleteFiles = hooks.useDeleteFilesAction();
  const deletePipelines = hooks.useDeletePipelinesAction();
  const deleteShabondis = hooks.useDeleteShabondisAction();
  const deleteStreams = hooks.useDeleteStreamsAction();
  const deleteTopics = hooks.useDeleteTopicsAction();
  const deleteWorker = hooks.useDeleteWorkerAction();
  const deleteWorkspace = hooks.useDeleteWorkspaceAction();
  const deleteZookeeper = hooks.useDeleteZookeeperAction();

  const steps = [
    {
      name: 'delete connectors',
      action: () => deleteConnectors(workspaceKey),
    },
    {
      name: 'delete streams',
      action: () => deleteStreams(workspaceKey),
    },
    {
      name: 'delete shabondis',
      action: () => deleteShabondis(workspaceKey),
    },
    {
      name: 'stop topics',
      action: () => stopTopics(workspaceKey),
    },
    {
      name: 'delete topics',
      action: () => deleteTopics(workspaceKey),
    },
    {
      name: 'stop worker',
      action: () => stopWorker(workspace?.worker?.name),
    },
    {
      name: 'delete worker',
      action: () => deleteWorker(workspace?.worker?.name),
    },
    {
      name: 'stop broker',
      action: () => stopBroker(workspace?.broker?.name),
    },
    {
      name: 'delete broker',
      action: () => deleteBroker(workspace?.broker?.name),
    },
    {
      name: 'stop zookeeper',
      action: () => stopZookeeper(workspace?.zookeeper?.name),
    },

    {
      name: 'delete zookeeper',
      action: () => deleteZookeeper(workspace?.zookeeper?.name),
    },
    {
      name: 'delete pipelines',
      action: () => deletePipelines(workspaceKey),
    },
    {
      name: 'delete files',
      action: () => deleteFiles(workspaceKey),
    },
    {
      name: 'delete workspace',
      action: () => deleteWorkspace(workspace?.name, { showLog: true }),
    },
  ];

  return (
    <Dialog
      data-testid="delete-workspace"
      fullWidth={isOpen}
      maxWidth={'md'}
      open={isOpen}
    >
      <DialogTitle>{'Delete Workspace 2'}</DialogTitle>
      <DialogContent>
        <Stepper onClose={onClose} steps={steps} />
      </DialogContent>
    </Dialog>
  );
};

DeleteWorkspace.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

DeleteWorkspace.defaultProps = {
  onClose: () => {},
};

export default DeleteWorkspace;
