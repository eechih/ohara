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
import { map } from 'lodash';
import { Field, reduxForm } from 'redux-form';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';

import { FORM } from 'const';
import * as hooks from 'hooks';
import * as validate from 'utils/validate';
import InputField from 'components/common/Form/InputField';

const SetupWorkspaceForm = props => {
  const { handleSubmit, previousStep, invalid, pristine, submitting } = props;

  const change = hooks.useReduxFormChangeAction();
  const defaultWorkspaceName = hooks.useUniqueWorkspaceName();
  const formValues = hooks.useReduxFormValues(FORM.CREATE_WORKSPACE);
  const workspaces = hooks.useAllWorkspaces();

  React.useEffect(() => {
    if (!formValues?.workspace?.name)
      change(FORM.CREATE_WORKSPACE, 'workspace.name', defaultWorkspaceName);
  }, [change, defaultWorkspaceName, formValues]);

  const workspaceNameRules = [
    validate.required,
    validate.validServiceName,
    validate.checkDuplicate(map(workspaces, 'name')),
    // Configurator API only accept length <= 25
    // we use the same rules here
    validate.maxLength(25),
  ];

  return (
    <form onSubmit={handleSubmit}>
      <Paper className="fields">
        <Field
          type="text"
          name="workspace.name"
          label="Workspace name"
          margin="normal"
          placeholder="workspace1"
          component={InputField}
          autoFocus
          required
          validate={validate.composeValidators(...workspaceNameRules)}
        />
      </Paper>
      <div className="buttons">
        <Button onClick={previousStep}>Back</Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={invalid || pristine || submitting}
        >
          Next
        </Button>
      </div>
    </form>
  );
};

SetupWorkspaceForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  previousStep: PropTypes.func.isRequired,
  invalid: PropTypes.bool.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
};

export default reduxForm({
  form: FORM.CREATE_WORKSPACE,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
})(SetupWorkspaceForm);
