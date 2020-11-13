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

import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as hooks from 'hooks';
import * as actions from 'store/actions';
import * as selectors from 'store/selectors';

export const useIsNodeLoaded = () => {
  const mapState = useCallback((state) => !!state.ui.node?.lastUpdated, []);
  return useSelector(mapState);
};

export const useIsNodeLoading = () => {
  const mapState = useCallback((state) => !!state.ui.node?.loading, []);
  return useSelector(mapState);
};

export const useAllNodes = () => {
  const fetchNodes = hooks.useFetchNodesAction();
  const isLoaded = hooks.useIsNodeLoaded();
  useEffect(() => {
    if (!isLoaded) fetchNodes();
  }, [fetchNodes, isLoaded]);

  return useSelector((state) => selectors.getAllNodes(state));
};

export const useNodesInWorkspace = () => {
  const getNodesByNames = useMemo(() => selectors.makeGetNodesByNames(), []);
  const workspace = hooks.useWorkspace();
  const { nodeNames } = workspace;
  return useSelector(
    useCallback((state) => getNodesByNames(state, { names: nodeNames }), [
      getNodesByNames,
      nodeNames,
    ]),
  );
};

export const useNodesInWorker = () => {
  const getNodesByNames = useMemo(() => selectors.makeGetNodesByNames(), []);
  const worker = hooks.useWorker();
  const { nodeNames } = worker;
  return useSelector(
    useCallback((state) => getNodesByNames(state, { names: nodeNames }), [
      getNodesByNames,
      nodeNames,
    ]),
  );
};

export const useNodesInBroker = () => {
  const getNodesByNames = useMemo(() => selectors.makeGetNodesByNames(), []);
  const broker = hooks.useBroker();
  const { nodeNames } = broker;
  return useSelector(
    useCallback((state) => getNodesByNames(state, { names: nodeNames }), [
      getNodesByNames,
      nodeNames,
    ]),
  );
};

export const useNodesInZookeeper = () => {
  const getNodesByNames = useMemo(() => selectors.makeGetNodesByNames(), []);
  const zookeeper = hooks.useZookeeper();
  const { nodeNames } = zookeeper;
  return useSelector(
    useCallback((state) => getNodesByNames(state, { names: nodeNames }), [
      getNodesByNames,
      nodeNames,
    ]),
  );
};

export const useCreateNodeAction = () => {
  const dispatch = useDispatch();
  return useCallback(
    (values, options) =>
      dispatch(actions.createNode.trigger({ params: values, options })),
    [dispatch],
  );
};

export const useUpdateNodeAction = () => {
  const dispatch = useDispatch();
  return (values) => {
    dispatch(actions.updateNode.trigger(values));
  };
};

export const useFetchNodesAction = () => {
  const dispatch = useDispatch();
  return () => {
    dispatch(actions.fetchNodes.trigger());
  };
};

export const useDeleteNodeAction = () => {
  const dispatch = useDispatch();
  return useCallback(
    (values) =>
      new Promise((resolve, reject) =>
        dispatch(
          actions.deleteNode.trigger({
            values,
            resolve,
            reject,
          }),
        ),
      ),
    [dispatch],
  );
};
