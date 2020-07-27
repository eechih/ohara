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
import styled from 'styled-components';

import * as context from 'context';
import { TAB } from 'context/devTool/const';
import { ViewTopic, ViewLog } from './View';

const TabPanel = styled.div`
  display: ${(props) => (props.value !== props.index ? 'none' : 'block')};
  position: absolute;
  width: 100%;
  top: 48px;
  height: calc(100% - 74px);
  overflow: auto;
`;

const Body = () => {
  const { tabName } = context.useDevTool();

  return (
    <>
      <TabPanel index={TAB.topic} value={tabName}>
        <ViewTopic />
      </TabPanel>
      <TabPanel index={TAB.log} value={tabName}>
        <ViewLog />
      </TabPanel>
    </>
  );
};

export default Body;
