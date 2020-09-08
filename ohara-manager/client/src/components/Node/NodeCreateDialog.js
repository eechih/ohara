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

import React from 'react';
import PropTypes from 'prop-types';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import Typography from '@material-ui/core/Typography';

import { InputField } from 'components/common/Form';
import { Dialog } from 'components/common/Dialog';
import {
  required,
  minNumber,
  maxLength,
  maxNumber,
  composeValidators,
} from 'utils/validate';

const NodeCreateDialog = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Form
      initialValues={{}}
      onSubmit={async (values, form) => {
        try {
          await onConfirm({ ...values, port: Number(values.port) });
          setTimeout(form.reset);
          onClose();
        } catch (error) {
          return { [FORM_ERROR]: error?.title };
        }
      }}
      render={({ handleSubmit, form, submitting, pristine, submitError }) => {
        return (
          <Dialog
            confirmDisabled={submitting || pristine}
            confirmText="CREATE"
            onClose={() => {
              onClose();
              form.reset();
            }}
            onConfirm={handleSubmit}
            open={isOpen}
            title="Create node"
          >
            <form onSubmit={handleSubmit}>
              <Field
                autoFocus
                component={InputField}
                helperText="hostname of the node"
                id="hostname"
                label="Hostname"
                margin="normal"
                name="hostname"
                placeholder="node-01"
                required
                type="text"
                validate={composeValidators(required, maxLength(63))}
              />
              <Field
                component={InputField}
                helperText="SSH port of the node"
                id="port"
                inputProps={{
                  min: 1,
                  max: 65535,
                }}
                label="Port"
                margin="normal"
                name="port"
                placeholder="22"
                type="number"
                validate={composeValidators(
                  required,
                  minNumber(1),
                  maxNumber(65535),
                )}
              />
              <Field
                component={InputField}
                fullWidth
                helperText="SSH username"
                id="user"
                label="User"
                margin="normal"
                name="user"
                placeholder="admin"
                validate={required}
              />
              <Field
                component={InputField}
                fullWidth
                helperText="SSH password"
                id="password"
                label="Password"
                margin="normal"
                name="password"
                placeholder="password"
                type="password"
                validate={required}
              />
              {submitError && (
                <Typography align="center" color="error" variant="h5">
                  {submitError}
                </Typography>
              )}
            </form>
          </Dialog>
        );
      }}
    />
  );
};

NodeCreateDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func.isRequired,
};

NodeCreateDialog.defaultProps = {
  onClose: () => {},
};

export default NodeCreateDialog;
