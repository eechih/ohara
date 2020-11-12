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
import * as hooks from 'hooks';
import WorkspaceNodeTable from './WorkspaceNodeTable';
import AddWorkspaceNodeDialog from './AddWorkspaceNodeDialog';
import NodeDetailDialog from 'components/Node/NodeDetailDialog';
import { Node } from 'types';

const WorkspaceNodeDialog: React.FC = () => {
  const workspaceName = hooks.useWorkspaceName() as string;
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentViewNode, setCurrentViewNode] = useState<Node | undefined>();

  return (
    <React.Fragment>
      <WorkspaceNodeTable
        onAddIconClick={(): void => {
          setIsAddDialogOpen(true);
        }}
        onColumnClick={(node: Node): void => {
          setCurrentViewNode(node);
          setIsViewDialogOpen(true);
        }}
        onViewIconClick={(node: Node): void => {
          setCurrentViewNode(node);
          setIsViewDialogOpen(true);
        }}
        workspaceName={workspaceName}
      />

      <AddWorkspaceNodeDialog
        onClose={(): void => {
          setIsAddDialogOpen(false);
        }}
        open={isAddDialogOpen}
        workspaceName={workspaceName}
      />

      <NodeDetailDialog
        isOpen={isViewDialogOpen}
        node={currentViewNode}
        onClose={(): void => {
          setCurrentViewNode(undefined);
          setIsViewDialogOpen(false);
        }}
      />
    </React.Fragment>
  );
};

export default WorkspaceNodeDialog;
