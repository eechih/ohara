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

import { useState } from 'react';
import PropTypes from 'prop-types';
import { isFunction, noop } from 'lodash';
import { DeleteDialog } from 'components/common/Dialog';

const defaultOptions = {
  content: (node) =>
    `Are you sure you want to delete the node ${node?.hostname}? This action cannot be undone!`,
  title: 'Delete node?',
};

function NodeDeleteDialog({ node, isOpen, onClose, onConfirm, ...restProps }) {
  const options = { ...defaultOptions, ...restProps.options };
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    setLoading(true);
    const res = onConfirm(node);
    if (res instanceof Promise) {
      res
        .then(() => {
          setLoading(false);
          onClose();
        })
        .catch(() => {
          setLoading(false);
          onClose();
        });
    } else {
      setLoading(false);
      onClose();
    }
  };

  return (
    <DeleteDialog
      content={
        isFunction(options?.content) ? options.content(node) : options?.content
      }
      isWorking={loading}
      onClose={loading ? noop : onClose}
      onConfirm={handleConfirm}
      open={isOpen}
      title={isFunction(options?.title) ? options.title(node) : options?.title}
    />
  );
}

NodeDeleteDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  node: PropTypes.shape({
    hostname: PropTypes.string,
  }),
  onClose: PropTypes.func,
  onConfirm: PropTypes.func.isRequired,
  options: PropTypes.shape({
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  }),
};

NodeDeleteDialog.defaultProps = {
  node: null,
  onClose: () => {},
  options: defaultOptions,
};

export default NodeDeleteDialog;
