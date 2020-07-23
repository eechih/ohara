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

import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { assign } from 'lodash';
import * as actions from 'store/actions';
import { DialogName, DevToolTabName } from 'const';

const useDialog = (
  dialogNameOrConfig = {},
  dataCreator,
  toKeepData = false,
) => {
  let dialogName;
  if (typeof dialogNameOrConfig === 'object') {
    dialogName = dialogNameOrConfig.dialogName;
    dataCreator = dialogNameOrConfig.dataCreator;
    toKeepData = dialogNameOrConfig.toKeepData;
  } else {
    dialogName = dialogNameOrConfig;
  }

  const dispatch = useDispatch();
  const dialogState = useSelector((state) => state.ui.dialog[dialogName]);
  const isDialogOpen = !!dialogState?.isOpen;
  const dialogData = dialogState?.data;
  const openDialog = useCallback(
    (data) => {
      const mergedData = toKeepData ? assign(dialogData, data) : data;
      const finalData = dataCreator ? dataCreator(mergedData) : mergedData;
      dispatch({
        type: actions.openDialog.TRIGGER,
        name: dialogName,
        payload: finalData,
      });
    },
    [dialogName, dialogData, dataCreator, toKeepData, dispatch],
  );
  const closeDialog = useCallback(() => {
    const finalData = toKeepData ? dialogData : null;
    dispatch({
      type: actions.openDialog.FULFILL,
      name: dialogName,
      payload: finalData,
    });
  }, [dialogName, dialogData, toKeepData, dispatch]);

  return useMemo(
    () => ({
      isOpen: isDialogOpen,
      data: dialogData,
      open: openDialog,
      close: closeDialog,
      toggle: (data) => (isDialogOpen ? closeDialog() : openDialog(data)),
    }),
    [isDialogOpen, dialogData, openDialog, closeDialog],
  );
};

export const useDevToolDialog = () =>
  useDialog({
    dialogName: DialogName.DEV_TOOL_DIALOG,
    dataCreator: (data) => {
      if (!data?.tabName) {
        // initialize the tab
        return assign(data, { tabName: DevToolTabName.TOPIC });
      }
      return data;
    },
    toKeepData: true,
  });

export const useEventLogDialog = () => useDialog(DialogName.EVENT_LOG_DIALOG);

export const useIntroDialog = () =>
  useDialog({
    dialogName: DialogName.INTRO_DIALOG,
    dataCreator: (data) => assign(data, { hasBeenOpened: true }),
    toKeepData: true,
  });
export const useNodeListDialog = () => useDialog(DialogName.NODE_LIST_DIALOG);

export const usePipelinePropertyDialog = () =>
  useDialog(DialogName.PIPELINE_PROPERTY_DIALOG);

export const useWorkspaceListDialog = () =>
  useDialog(DialogName.WORKSPACE_LIST_DIALOG);

export const useWorkspaceSettingsDialog = () =>
  useDialog(DialogName.WORKSPACE_SETTINGS_DIALOG);
