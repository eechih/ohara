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
import { Dialog } from 'components/common/Dialog';
import WorkspaceFileTable from './WorkspaceFileTable';

const WorkspaceFileSelectorDialog = props => {
  const { isOpen, onClose, onConfirm, tableProps, title } = props;
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleSelectionChange = selectFiles => {
    setSelectedFiles(selectFiles);
  };

  const handleCancel = () => {
    setSelectedFiles([]);
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(selectedFiles);
    setSelectedFiles([]);
  };

  return (
    <Dialog
      title={title}
      open={isOpen}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      confirmDisabled={selectedFiles?.length === 0}
      confirmText="Save"
      maxWidth="md"
    >
      <WorkspaceFileTable
        filter={tableProps?.filter}
        onSelectionChange={handleSelectionChange}
        options={{
          selection: true,
        }}
      />
    </Dialog>
  );
};

WorkspaceFileSelectorDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  tableProps: PropTypes.shape({
    filter: PropTypes.func,
  }),
  title: PropTypes.string,
};

WorkspaceFileSelectorDialog.defaultProps = {
  onClose: () => {},
  onConfirm: () => {},
  tableProps: {},
  title: 'Select file',
};

export default WorkspaceFileSelectorDialog;
