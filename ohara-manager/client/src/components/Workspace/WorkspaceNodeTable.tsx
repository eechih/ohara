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

/* eslint-disable @typescript-eslint/no-floating-promises */
import React, { useMemo, memo, Fragment } from 'react';
import MaterialTable from 'material-table';
import { filter, includes, map, isArray, capitalize } from 'lodash';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';

import MuiTableIcons from 'components/common/Table/MuiTableIcons';
import useWorkspace from 'hooks/useWorkspace';
import useNodes from 'hooks/useNodes';
import { Node } from 'types';
import ResourceBarChart from 'components/common/ResourceBarChart';
import NodeStateChip from 'components/Node/NodeStateChip';
import {
  getServiceCountOfNode,
  getAllClusterKeysByWorkspaceName,
} from 'utils/nodeUtils';

// Refetch every 5 seconds
const refetchInterval = 5000;

interface WorkspaceNodeTableProps {
  workspaceName: string;
  onAddIconClick?: () => void;
  onColumnClick?: (node: Node, columnName: string) => void;
  onViewIconClick?: (node: Node) => void;
}

const WorkspaceNodeTable: React.FC<WorkspaceNodeTableProps> = ({
  workspaceName,
  onAddIconClick,
  onColumnClick,
  onViewIconClick,
}) => {
  const {
    data: workspace,
    isLoading: isWorkspaceLoading,
    refetch: refetchWorkspace,
  } = useWorkspace(workspaceName);

  const {
    data: nodes,
    isLoading: isNodesLoading,
    refetch: refetchNodes,
  } = useNodes({ refetchInterval });

  const workspaceNodes: Node[] = useMemo(() => {
    if (workspace?.nodeNames) {
      return filter(nodes, (node) =>
        includes(workspace.nodeNames, node.hostname),
      );
    }
    return [];
  }, [workspace, nodes]);

  return (
    <Fragment>
      <MaterialTable
        actions={[
          {
            icon: 'refresh',
            tooltip: 'Refresh',
            isFreeAction: true,
            onClick: (): void => {
              refetchWorkspace();
              refetchNodes();
            },
          },
          {
            icon: 'add',
            tooltip: 'Add node',
            isFreeAction: true,
            onClick: (): void => {
              if (onAddIconClick) {
                onAddIconClick();
              }
            },
          },
          {
            icon: 'visibility',
            tooltip: 'View node',
            onClick: (_, data: Node | Node[]): void => {
              if (onViewIconClick) {
                if (isArray(data)) {
                  onViewIconClick(data[0]);
                } else {
                  onViewIconClick(data);
                }
              }
            },
          },
        ]}
        columns={[
          { title: 'Name', field: 'hostname' },
          {
            title: 'Resources',
            render: (node: Node): JSX.Element[] => {
              return map(node.resources, (resource) => (
                <ResourceBarChart resource={resource} />
              ));
            },
          },
          {
            title: 'Services',
            render: (node: Node): JSX.Element => {
              const count = getServiceCountOfNode(node);
              return (
                <Tooltip title="View services">
                  <Button
                    color="primary"
                    component="div"
                    disabled={!(count > 0)}
                    onClick={(): void => {
                      if (onColumnClick) {
                        onColumnClick(node, 'services');
                      }
                    }}
                  >
                    {count}
                  </Button>
                </Tooltip>
              );
            },
          },
          {
            title: 'Used',
            render: (node: Node): JSX.Element[] => {
              const clusterKeys = getAllClusterKeysByWorkspaceName(
                node,
                workspaceName,
              );
              const serviceKinds: string[] = map(clusterKeys, 'group').sort();
              return map(serviceKinds, (serviceKind: string) => (
                <div>{capitalize(serviceKind)}</div>
              ));
            },
          },
          {
            title: 'State',
            field: 'state',
            render: (node: Node): JSX.Element => <NodeStateChip node={node} />,
          },
        ]}
        data={workspaceNodes}
        icons={MuiTableIcons}
        isLoading={isNodesLoading || isWorkspaceLoading}
        options={{
          actionsColumnIndex: -1,
          search: false,
          paging: workspaceNodes?.length > 5,
        }}
        title="Workspace nodes"
      />
    </Fragment>
  );
};

export default memo(WorkspaceNodeTable);
