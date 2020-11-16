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
import { capitalize } from 'lodash';

import Chip from '@material-ui/core/Chip';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import HelpIcon from '@material-ui/icons/Help';
import { SERVICE_STATE } from 'api/apiInterface/clusterInterface';
import useBroker from 'hooks/useBroker';
import useShabondi from 'hooks/useShabondi';
import useStream from 'hooks/useStream';
import useWorker from 'hooks/useWorker';
import useZookeeper from 'hooks/useZookeeper';
import { Key } from 'types';
import { ServiceName } from 'const';

// Refetch every 5 seconds
const refetchInterval = 5000;

interface StateChipProps {
  state?: string;
}

const StateChip: React.FC<StateChipProps> = ({ state }) => {
  if (state === SERVICE_STATE.RUNNING) {
    return (
      <Chip
        color="primary"
        icon={<CheckCircleIcon />}
        label={capitalize(state)}
        size="small"
        variant="outlined"
      />
    );
  } else {
    return (
      <Chip
        icon={<HelpIcon />}
        label={state ? capitalize(state) : 'Unknown'}
        size="small"
        variant="outlined"
      />
    );
  }
};

interface ClusterStateChipProps {
  clusterKey: Key;
  serviceName?:
    | ServiceName.BROKER
    | ServiceName.SHABONDI
    | ServiceName.STREAM
    | ServiceName.WORKER
    | ServiceName.ZOOKEEPER;
}

const BrokerStateChip: React.FC<ClusterStateChipProps> = ({ clusterKey }) => {
  const { data: cluster } = useBroker(clusterKey, { refetchInterval });
  return <StateChip state={cluster?.state} />;
};

const ShabondiStateChip: React.FC<ClusterStateChipProps> = ({ clusterKey }) => {
  const { data: cluster } = useShabondi(clusterKey, { refetchInterval });
  return <StateChip state={cluster?.state} />;
};

const StreamStateChip: React.FC<ClusterStateChipProps> = ({ clusterKey }) => {
  const { data: cluster } = useStream(clusterKey, { refetchInterval });
  return <StateChip state={cluster?.state} />;
};

const WorkerStateChip: React.FC<ClusterStateChipProps> = ({ clusterKey }) => {
  const { data: cluster } = useWorker(clusterKey, { refetchInterval });
  return <StateChip state={cluster?.state} />;
};

const ZookeeperStateChip: React.FC<ClusterStateChipProps> = ({
  clusterKey,
}) => {
  const { data: cluster } = useZookeeper(clusterKey, { refetchInterval });
  return <StateChip state={cluster?.state} />;
};

const ClusterStateChip: React.FC<ClusterStateChipProps> = ({
  clusterKey,
  serviceName,
}) => {
  switch (serviceName) {
    case ServiceName.BROKER:
      return <BrokerStateChip clusterKey={clusterKey} />;
    case ServiceName.SHABONDI:
      return <ShabondiStateChip clusterKey={clusterKey} />;
    case ServiceName.STREAM:
      return <StreamStateChip clusterKey={clusterKey} />;
    case ServiceName.WORKER:
      return <WorkerStateChip clusterKey={clusterKey} />;
    case ServiceName.ZOOKEEPER:
      return <ZookeeperStateChip clusterKey={clusterKey} />;
    default:
      return <div />;
  }
};

export default ClusterStateChip;
