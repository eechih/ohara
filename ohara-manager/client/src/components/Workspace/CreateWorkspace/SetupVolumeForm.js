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

/* eslint-disable no-throw-literal */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Form } from 'const';
import {
  ValidateInputField,
  Checkbox as CheckboxField,
} from 'components/common/Form';
import { validateVolumePath } from 'observables/volumes';

const validate = (values) => {
  const errors = {};
  if (values.volume?.enabled && !values.volume?.path) {
    errors.volume = { path: 'This is a required field' };
  }
  return errors;
};

const asyncValidate = async (values) => {
  const { workspace = {}, volume = {} } = values;
  const { nodeNames } = workspace;
  const { enabled, path } = volume;

  if (enabled) {
    try {
      if (!path) throw 'This is a required field';
      await validateVolumePath(path, nodeNames);
    } catch (err) {
      throw { volume: { path: err } };
    }
  }
};

const shouldAsyncValidate = ({ trigger }) => {
  return trigger === 'submit';
};

let SetupVolumeForm = ({
  asyncValidating,
  handleSubmit,
  previousStep,
  invalid,
  pristine,
  submitting,
  enabled,
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <Paper className="fields">
        <Field
          component={CheckboxField}
          disabled={!!asyncValidating}
          label="Enable volumes"
          name="volume.enabled"
        />
        <Field
          component={ValidateInputField}
          disabled={!enabled || !!asyncValidating}
          helperText="Please provide the path and we will create this folder on each node you select. Other service volumes will be placed under this path."
          id="workspaceVolume"
          label="Volume path"
          margin="normal"
          name="volume.path"
          placeholder="/home/ohara/workspace1"
          type="text"
        />
      </Paper>
      <div className="buttons">
        <Button onClick={previousStep}>BACK</Button>
        <Button
          color="primary"
          disabled={invalid || pristine || submitting || !!asyncValidating}
          endIcon={asyncValidating ? <CircularProgress size={16} /> : null}
          type="submit"
          variant="contained"
        >
          {asyncValidating ? 'VALIDATING' : 'NEXT'}
        </Button>
      </div>
    </form>
  );
};

SetupVolumeForm.propTypes = {
  asyncValidating: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  handleSubmit: PropTypes.func.isRequired,
  previousStep: PropTypes.func.isRequired,
  invalid: PropTypes.bool.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  enabled: PropTypes.bool,
};

SetupVolumeForm = reduxForm({
  form: Form.CREATE_WORKSPACE,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  validate,
  asyncValidate,
  shouldAsyncValidate,
})(SetupVolumeForm);

const selector = formValueSelector(Form.CREATE_WORKSPACE);

SetupVolumeForm = connect((state) => {
  return {
    enabled: selector(state, 'volume.enabled'),
  };
})(SetupVolumeForm);

export default SetupVolumeForm;
