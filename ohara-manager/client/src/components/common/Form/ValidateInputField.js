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
import { isObject } from 'lodash';
import TextField from '@material-ui/core/TextField';
import styled from 'styled-components';

const InputWrap = styled.div`
  position: relative;
  width: 100%;
`;

const StyledTextField = styled(TextField)`
  width: ${(props) => props.width};
`;

const ValidateInputField = (props) => {
  const {
    input: { name, onChange, value, onBlur, ...restInput },
    width = '100%',
    helperText,
    disabled,
    meta: { touched, error },
    ...rest
  } = props;

  const hasError = touched && !!error;

  return (
    <InputWrap>
      <StyledTextField
        {...rest}
        disabled={disabled}
        error={hasError}
        helperText={
          hasError
            ? isObject(error)
              ? JSON.stringify(error)
              : error
            : helperText
        }
        id={name}
        InputProps={restInput}
        name={name}
        onBlur={() => onBlur(value)}
        onChange={onChange}
        value={value}
        width={width}
      />
    </InputWrap>
  );
};

ValidateInputField.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.object,
    ]).isRequired,
  }).isRequired,
  meta: PropTypes.shape({
    dirty: PropTypes.bool,
    touched: PropTypes.bool,
    error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }),
  width: PropTypes.string,
  helperText: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  errorMessage: PropTypes.string,
  hasError: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default ValidateInputField;
