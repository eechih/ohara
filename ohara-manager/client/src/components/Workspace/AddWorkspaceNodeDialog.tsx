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

import React, { useMemo } from 'react';
import { filter, includes, map } from 'lodash';
import { FormApi } from 'final-form';
import { Form, FormRenderProps } from 'react-final-form';
import { Select } from 'mui-rff';
import MenuItem from '@material-ui/core/MenuItem';

import { Dialog } from 'components/common/Dialog';
import useWorkspace from 'hooks/useWorkspace';
import useNodes from 'hooks/useNodes';
import useUpdateWorkspace from 'hooks/useUpdateWorkspace';
import { Node } from 'types';

interface AddWorkspaceNodeDialogProps {
  workspaceName: string;
  open: boolean;
  onClose: () => void;
}

export interface FormData {
  nodeName: string;
}

const AddWorkspaceNodeDialog: React.FC<AddWorkspaceNodeDialogProps> = ({
  open,
  onClose,
  workspaceName,
}) => {
  const { data: workspace, isLoading: isWorkspaceLoading } = useWorkspace(
    workspaceName,
  );
  const { data: nodes, isLoading: isNodesLoading } = useNodes();
  const [updateWorkspace] = useUpdateWorkspace();

  const nodesToBeSelected: Node[] = useMemo(() => {
    if (workspace?.nodeNames) {
      return filter(
        nodes,
        (node) => !includes(workspace.nodeNames, node.hostname),
      );
    }
    return [];
  }, [workspace, nodes]);

  const hasNodesToBeSelected = nodesToBeSelected?.length > 0 || false;

  async function handleSubmit(
    values: FormData,
    form: FormApi<FormData>,
  ): Promise<void> {
    const { nodeName } = values;
    if (workspace) {
      await updateWorkspace({
        ...workspace,
        nodeNames: [...(workspace.nodeNames as string[]), nodeName],
      });
    }
    setTimeout(form.reset);
    onClose();
  }

  return (
    <Form
      initialValues={{}}
      onSubmit={handleSubmit}
      render={(props: FormRenderProps<FormData>): React.ReactNode => (
        <Dialog
          confirmDisabled={props.invalid || props.pristine || props.submitting}
          loading={isWorkspaceLoading || isNodesLoading}
          onClose={onClose}
          onConfirm={props.handleSubmit}
          open={open}
          title="Add workspace node"
        >
          <Select
            disabled={!hasNodesToBeSelected}
            formControlProps={{ margin: 'normal' }}
            label="Select a Node"
            name="nodeName"
          >
            {map(
              nodesToBeSelected,
              (node: Node): JSX.Element => {
                return (
                  <MenuItem key={node.hostname} value={node.hostname}>
                    {node.hostname}
                  </MenuItem>
                );
              },
            )}
          </Select>
        </Dialog>
      )}
    />
  );
};

export default AddWorkspaceNodeDialog;
