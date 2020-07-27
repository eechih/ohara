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

import React, { useRef } from 'react';
import SplitPane from 'react-split-pane';
import { useParams } from 'react-router-dom';

import AppBar from './AppBar';
import Pipeline from 'components/Pipeline';
import Navigator from './Navigator';
import EventLog from 'components/EventLog';
import * as context from 'context';
import { DevToolDialog } from 'components/DevTool';
import {
  WorkspaceList as ListWorkspacesDialog,
  CreateWorkspace as CreateWorkspaceDialog,
} from 'components/Workspace';
import IntroDialog from 'components/Intro';

import StyledSnackbar from 'components/common/Snackbar';
import { Wrapper } from './AppLayoutStyles';
import * as hooks from 'hooks';

const AppLayout = () => {
  const { workspaceName, pipelineName } = useParams();
  hooks.useInitializeApp(workspaceName, pipelineName);
  hooks.useWelcome();

  const { isOpen: isDevToolOpen } = context.useDevToolDialog();
  const { isOpen: isEventLogOpen } = context.useEventLogDialog();

  const pipelineApiRef = useRef(null);

  return (
    <Wrapper>
      <SplitPane allowResize={false} defaultSize={64} split="vertical">
        <AppBar />
        <SplitPane
          defaultSize={isDevToolOpen || isEventLogOpen ? 240 : 0}
          maxSize={isDevToolOpen || isEventLogOpen ? 480 : 0}
          minSize={isDevToolOpen || isEventLogOpen ? 80 : 0}
          primary="second"
          split="horizontal"
        >
          <SplitPane
            defaultSize={240}
            maxSize={320}
            minSize={160}
            split="vertical"
          >
            <Navigator pipelineApi={pipelineApiRef.current} />
            <Pipeline ref={pipelineApiRef} />
          </SplitPane>
          {isEventLogOpen && <EventLog />}
          {isDevToolOpen && <DevToolDialog />}
          <div />
        </SplitPane>
      </SplitPane>

      <IntroDialog quickModeText={'QUICK CREATE'} />
      <CreateWorkspaceDialog />
      <ListWorkspacesDialog />
      <StyledSnackbar />
    </Wrapper>
  );
};

export default AppLayout;
