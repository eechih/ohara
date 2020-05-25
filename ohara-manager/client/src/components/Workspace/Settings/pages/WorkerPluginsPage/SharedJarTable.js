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
  some,
  reject,
  toUpper,
} from 'lodash';
import Link from '@material-ui/core/Link';
import Tooltip from '@material-ui/core/Tooltip';

import { FileTable } from 'components/File';
import * as context from 'context';
import * as hooks from 'hooks';
import { getKey } from 'utils/object';
import WorkspaceFileSelectorDialog from '../../common/WorkspaceFileSelectorDialog';

function SharedJarTable() {
  const workspaceFiles = hooks.useFiles();
  const worker = hooks.useWorker();
  const workspace = hooks.useWorkspace();
  const updateWorkspace = hooks.useUpdateWorkspaceAction();
  const pipelines = hooks.usePipelines();
  const switchPipeline = hooks.useSwitchPipelineAction();
  const { close: closeSettingsDialog } = context.useEditWorkspaceDialog();

  const selectorDialogRef = useRef(null);
  const [isSelectorDialogOpen, setIsSelectorDialogOpen] = useState(false);

  const documentation = useMemo(() => {
    return find(
      worker?.settingDefinitions,
      definition => definition.key === 'sharedJarKeys',
    )?.documentation;
  }, [worker]);

  const workerSharedJars = useMemo(() => {
    return filter(
      map(worker?.sharedJarKeys, sharedJarKey =>
        find(workspaceFiles, file => file.name === sharedJarKey.name),
      ),
    ).map(file => {
      return {
        ...file,
        pipelines: filter(pipelines, pipeline => {
          return some(pipeline?.jarKeys, jarKey => jarKey.name === file?.name);
        }),
      };
    });
  }, [worker, workspaceFiles, pipelines]);

  const workspaceSharedJars = useMemo(() => {
    return workspace?.worker?.sharedJarKeys
      ? filter(
          map(workspace.worker.sharedJarKeys, sharedJarKey =>
            find(workspaceFiles, file => file.name === sharedJarKey.name),
          ),
        )
      : workerSharedJars;
  }, [workspace, workerSharedJars, workspaceFiles]);

  const updateSharedJarKeysToWorkspace = newSharedJarKeys => {
    updateWorkspace({
      ...workspace,
      worker: {
        ...workspace?.worker,
        sharedJarKeys: newSharedJarKeys,
      },
    });

    const newSelectedFiles = filter(
      map(newSharedJarKeys, sharedJarKey =>
        find(workspaceFiles, file => file.name === sharedJarKey.name),
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
      workspace?.worker?.sharedJarKeys,
      sharedJarKey => sharedJarKey.name === fileToRemove.name,
    );

    if (shouldBeRemoved) {
      const newSharedJarKeys = reject(
        workspace?.worker?.sharedJarKeys,
        sharedJarKey => sharedJarKey.name === fileToRemove.name,
      );
      updateSharedJarKeysToWorkspace(newSharedJarKeys);
    }
  };

  const handleSelectorDialogConfirm = selectedFiles => {
    const newSharedJarKeys = map(selectedFiles, file => getKey(file));
    updateSharedJarKeysToWorkspace(newSharedJarKeys);
    setIsSelectorDialogOpen(false);
  };

  const handleUndoIconClick = fileClicked => {
    if (!fileClicked?.group || !fileClicked?.name) return;

    const shouldBeAdded = every(
      workspace?.worker?.sharedJarKeys,
      sharedJarKey => sharedJarKey.name !== fileClicked.name,
    );

    if (shouldBeAdded) {
      const newSharedJarKeys = [
        ...workspace?.worker?.sharedJarKeys,
        getKey(fileClicked),
      ];
      updateSharedJarKeysToWorkspace(newSharedJarKeys);
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
        files={workspaceSharedJars}
        onRemove={handleRemove}
        options={{
          comparison: true,
          comparedFiles: workerSharedJars,
          onAddIconClick: handleAddIconClick,
          onUndoIconClick: handleUndoIconClick,
          prompt: documentation,
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
        title="Shared jars"
      />

      <WorkspaceFileSelectorDialog
        isOpen={isSelectorDialogOpen}
        onClose={() => setIsSelectorDialogOpen(false)}
        onConfirm={handleSelectorDialogConfirm}
        ref={selectorDialogRef}
        tableProps={{
          options: {
            selectedFiles: workspaceSharedJars,
          },
          title: 'Files',
        }}
      />
    </>
  );
}

export default SharedJarTable;
