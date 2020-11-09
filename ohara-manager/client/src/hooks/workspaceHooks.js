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
import { map, size, xor } from 'lodash';

import { GROUP } from 'const';
import * as hooks from 'hooks';
import * as actions from 'store/actions';
import * as selectors from 'store/selectors';
import { getId } from 'utils/object';

export const useWorkspaceGroup = () => GROUP.WORKSPACE;

export const useIsWorkspaceReady = () => {
  const mapState = useCallback((state) => !!state.ui.workspace.lastUpdated, []);
  return useSelector(mapState);
};

export const useWorkspaceName = () =>
  useSelector(useCallback((state) => selectors.getWorkspaceName(state), []));

export const useWorkspaceKey = () => {
  const group = useWorkspaceGroup();
  const name = useWorkspaceName();
  return useMemo(() => ({ group, name }), [group, name]);
};

export const useWorkspaceId = () => {
  const group = useWorkspaceGroup();
  const name = useWorkspaceName();
  return useMemo(() => getId({ group, name }), [group, name]);
};

export const useFetchWorkspacesAction = () => {
  const dispatch = useDispatch();
  return useCallback(
    () =>
      new Promise((resolve, reject) =>
        dispatch(actions.fetchWorkspaces.trigger({ resolve, reject })),
      ),
    [dispatch],
  );
};

export const useCreateWorkspaceAction = () => {
  const dispatch = useDispatch();
  return useCallback(
    (values) =>
      new Promise((resolve, reject) =>
        dispatch(
          actions.createWorkspace.trigger({
            values,
            resolve,
            reject,
          }),
        ),
      ),
    [dispatch],
  );
};

export const useSwitchWorkspaceAction = () => {
  const dispatch = useDispatch();
  const group = hooks.useWorkspaceGroup();
  return useCallback(
    (name) => dispatch(actions.switchWorkspace.trigger({ group, name })),
    [dispatch, group],
  );
};

export const useAllWorkspaces = () =>
  useSelector(useCallback((state) => selectors.getAllWorkspaces(state), []));

export const useWorkspace = () => {
  const id = hooks.useWorkspaceId();
  return useSelector(
    useCallback((state) => selectors.getWorkspaceById(state, { id }), [id]),
  );
};

export const useUpdateWorkspaceAction = () => {
  const dispatch = useDispatch();
  const group = hooks.useWorkspaceGroup();
  return useCallback(
    (values) =>
      new Promise((resolve, reject) =>
        dispatch(
          actions.updateWorkspace.trigger({
            values: { ...values, group },
            resolve,
            reject,
          }),
        ),
      ),
    [dispatch, group],
  );
};

export const useDeleteWorkspaceAction = () => {
  const dispatch = useDispatch();
  const group = hooks.useWorkspaceGroup();
  return useCallback(
    (name) =>
      new Promise((resolve, reject) =>
        dispatch(
          actions.deleteWorkspace.trigger({
            values: { workspaceKey: { group, name } },
            resolve,
            reject,
          }),
        ),
      ),
    [dispatch, group],
  );
};

export const useDiscardWorkspaceChangedSettingsAction = () => {
  const broker = hooks.useBroker();
  const worker = hooks.useWorker();
  const workspace = hooks.useWorkspace();
  const updateWorkspace = hooks.useUpdateWorkspaceAction();

  return useCallback(() => {
    updateWorkspace({ ...workspace, broker, worker });
  }, [updateWorkspace, workspace, broker, worker]);
};

export const useShouldBeRestartWorkspace = () => {
  const worker = hooks.useWorker();
  const workspace = hooks.useWorkspace();

  const memoizedValue = useMemo(() => {
    const countOfChangedWorkerNodes = workspace?.worker?.nodeNames
      ? size(xor(worker?.nodeNames, workspace.worker.nodeNames))
      : 0;

    const countOfChangedWorkerPlugins = workspace?.worker?.pluginKeys
      ? size(
          xor(
            map(worker?.pluginKeys, (key) => key.name),
            map(workspace.worker.pluginKeys, (key) => key.name),
          ),
        )
      : 0;

    const countOfChangedWorkerSharedJars = workspace?.worker?.sharedJarKeys
      ? size(
          xor(
            map(worker?.sharedJarKeys, (key) => key.name),
            map(workspace.worker.sharedJarKeys, (key) => key.name),
          ),
        )
      : 0;

    const shouldBeRestartWorker =
      countOfChangedWorkerNodes > 0 ||
      countOfChangedWorkerPlugins > 0 ||
      countOfChangedWorkerSharedJars > 0;
    const shouldBeRestartWorkspace = shouldBeRestartWorker;

    return {
      countOfChangedWorkerNodes,
      countOfChangedWorkerPlugins,
      countOfChangedWorkerSharedJars,
      shouldBeRestartWorker,
      shouldBeRestartWorkspace,
    };
  }, [worker, workspace]);

  return memoizedValue;
};
