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

import React, { useMemo, useState, useRef } from 'react';
import {
  every,
  filter,
  find,
  includes,
  isEmpty,
  map,
  reject,
  some,
  toUpper,
} from 'lodash';
import Link from '@material-ui/core/Link';
import Tooltip from '@material-ui/core/Tooltip';

import { FileTable } from 'components/File';
import * as hooks from 'hooks';
import * as context from 'context';
import { getKey } from 'utils/object';
import WorkspaceFileSelectorDialog from '../common/WorkspaceFileSelectorDialog';

function StreamJarsPage() {
  const workspaceFiles = hooks.useFiles();
  const pipelines = hooks.usePipelines();
  const workspace = hooks.useWorkspace();
  const updateWorkspace = hooks.useUpdateWorkspaceAction();
  const switchPipeline = hooks.useSwitchPipelineAction();
  const { close: closeSettingsDialog } = context.useEditWorkspaceDialog();

  const selectorDialogRef = useRef(null);
  const [isSelectorDialogOpen, setIsSelectorDialogOpen] = useState(false);

  const streamJars = useMemo(() => {
    return filter(
      map(workspace?.stream?.jarKeys, jarKey =>
        find(workspaceFiles, file => file.name === jarKey.name),
      ),
    ).map(file => {
      return {
        ...file,
        pipelines: filter(pipelines, pipeline => {
          return some(pipeline?.jarKeys, jarKey => jarKey.name === file?.name);
        }),
      };
    });
  }, [workspace, workspaceFiles, pipelines]);

  const updateStreamJarKeysToWorkspace = newJarKeys => {
    updateWorkspace({
      ...workspace,
      stream: {
        ...workspace?.stream,
        jarKeys: newJarKeys,
      },
    });

    const newSelectedFiles = filter(
      map(newJarKeys, jarKey =>
        find(workspaceFiles, file => file.name === jarKey.name),
      ),
    );

    selectorDialogRef.current.setSelectedFiles(newSelectedFiles);
  };

  const handleAddIconClick = () => {
    setIsSelectorDialogOpen(true);
  };

  const handleRemove = fileToRemove => {
    if (!fileToRemove?.group || !fileToRemove?.name) return;

    const shouldBeRemoved = some(
      workspace?.stream?.jarKeys,
      jarKey => jarKey.name === fileToRemove.name,
    );

    if (shouldBeRemoved) {
      const newJarKeys = reject(
        workspace?.stream?.jarKeys,
        jarKey => jarKey.name === fileToRemove.name,
      );
      updateStreamJarKeysToWorkspace(newJarKeys);
    }
  };

  const handleSelectorDialogConfirm = selectedFiles => {
    const newJarKeys = map(selectedFiles, file => getKey(file));
    updateStreamJarKeysToWorkspace(newJarKeys);
    setIsSelectorDialogOpen(false);
  };

  const handleUndoIconClick = fileClicked => {
    if (!fileClicked?.group || !fileClicked?.name) return;

    const shouldBeAdded = every(
      workspace?.stream?.jarKeys,
      jarKey => jarKey.name !== fileClicked.name,
    );

    if (shouldBeAdded) {
      const newJarKeys = [workspace?.stream?.jarKeys, getKey(fileClicked)];
      updateStreamJarKeysToWorkspace([newJarKeys]);
    } else {
      handleRemove(fileClicked);
    }
  };

  const handleLinkClick = pipelineClicked => {
    if (pipelineClicked?.name) {
      closeSettingsDialog();
      switchPipeline(pipelineClicked.name);
    }
  };

  return (
    <>
      <FileTable
        files={streamJars}
        onRemove={handleRemove}
        options={{
          onAddIconClick: handleAddIconClick,
          onUndoIconClick: handleUndoIconClick,
          showAddIcon: true,
          showUploadIcon: false,
          showDeleteIcon: false,
          showDownloadIcon: false,
          showRemoveIcon: true,
          disabledRemoveIcon: rowData => !isEmpty(rowData?.pipelines),
          removeTooltip: rowData =>
            !isEmpty(rowData?.pipelines)
              ? 'Cannot remove files used by pipeline'
              : 'Remove file',
          customColumns: [
            {
              title: 'Pipelines',
              customFilterAndSearch: (filterValue, file) => {
                const value = file?.pipelines
                  ?.map(pipeline => pipeline?.name)
                  .join();
                return includes(toUpper(value), toUpper(filterValue));
              },
              render: file => {
                return (
                  <>
                    {map(file?.pipelines, pipeline => (
                      <div key={pipeline.name}>
                        <Tooltip title="Click the link to switch to that pipeline">
                          <Link
                            component="button"
                            variant="body2"
                            onClick={() => handleLinkClick(pipeline)}
                          >
                            {pipeline.name}
                          </Link>
                        </Tooltip>
                      </div>
                    ))}
                  </>
                );
              },
            },
          ],
        }}
        title="Stream jars"
      />

      <WorkspaceFileSelectorDialog
        isOpen={isSelectorDialogOpen}
        onClose={() => setIsSelectorDialogOpen(false)}
        onConfirm={handleSelectorDialogConfirm}
        ref={selectorDialogRef}
        tableProps={{
          options: {
            selectedFiles: streamJars,
            showDeleteIcon: true,
          },
          title: 'Files',
        }}
      />
    </>
  );
}

export default StreamJarsPage;
