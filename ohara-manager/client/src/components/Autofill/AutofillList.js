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
import { get, map, reject } from 'lodash';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';
import EditIcon from '@material-ui/icons/Edit';
import FileCopyIcon from '@material-ui/icons/FileCopyOutlined';

import { DeleteDialog } from 'components/common/Dialog';
import { Tooltip } from 'components/common/Tooltip';
import AutofillEditor, { MODE } from './AutofillEditor';
import * as hooks from 'hooks';
import Wrapper from './AutofillListStyles';

const AutofillList = () => {
  const [editorMode, setEditorMode] = useState(MODE.ADD);
  const [selectedData, setSelectedData] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const workspace = hooks.useWorkspace();
  const updateWorkspace = hooks.useUpdateWorkspaceAction();

  const handleAddButtonClick = () => {
    setEditorMode(MODE.ADD);
    setSelectedData(null);
    setIsEditorOpen(true);
  };

  const handleEditButtonClick = data => {
    setEditorMode(MODE.EDIT);
    setSelectedData(data);
    setIsEditorOpen(true);
  };

  const handleCopyButtonClick = data => {
    setEditorMode(MODE.COPY);
    setSelectedData(data);
    setIsEditorOpen(true);
  };

  const handleDeleteButtonClick = data => {
    setSelectedData(data);
    setIsDeleteConfirmOpen(true);
  };

  const handleDelete = () => {
    const name = get(selectedData, 'name');
    updateWorkspace({
      name: workspace.name,
      settingFillings: reject(
        workspace?.settingFillings,
        settingFilling => settingFilling.name === name,
      ),
    });
    setIsDeleteConfirmOpen(false);
  };

  const handleEditorClose = () => {
    setEditorMode(MODE.ADD);
    setSelectedData(null);
    setIsEditorOpen(false);
  };

  return (
    <Wrapper>
      <List>
        {map(workspace?.settingFillings, settingFilling => {
          return (
            <ListItem key={settingFilling.name} divider alignItems="flex-start">
              <ListItemText primary={settingFilling.displayName} />
              <ListItemSecondaryAction>
                <Tooltip title="Edit the autofill">
                  <IconButton
                    onClick={() => handleEditButtonClick(settingFilling)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Copy the autofill">
                  <IconButton
                    onClick={() => handleCopyButtonClick(settingFilling)}
                  >
                    <FileCopyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete the autofill">
                  <IconButton
                    onClick={() => handleDeleteButtonClick(settingFilling)}
                  >
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>
      <Tooltip title="Add an autofill" placement="right">
        <Button
          className="add-button"
          color="primary"
          onClick={handleAddButtonClick}
          startIcon={<AddIcon />}
          variant="outlined"
        >
          Add Autofill
        </Button>
      </Tooltip>
      <AutofillEditor
        isOpen={isEditorOpen}
        mode={editorMode}
        onClose={handleEditorClose}
        data={selectedData}
      />
      <DeleteDialog
        title="Delete Autofill?"
        content={`Are you sure you want to delete the autofill: ${get(
          selectedData,
          'displayName',
        )} ? This action cannot be undone!`}
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </Wrapper>
  );
};

export default AutofillList;
