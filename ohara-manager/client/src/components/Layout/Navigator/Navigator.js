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
import MenuItem from '@material-ui/core/MenuItem';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AddIcon from '@material-ui/icons/Add';
import Menu from '@material-ui/core/Menu';
import Typography from '@material-ui/core/Typography';

import * as hooks from 'hooks';
import PipelineList from './PipelineList';
import Outline from './Outline';
import AddPipelineDialog from './AddPipelineDialog';
import WorkspaceSettings from 'components/Workspace/Settings';
import { Button } from 'components/common/Form';
import { StyledNavigator, StyledAccordion } from './NavigatorStyles';

const Navigator = ({ pipelineApi }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const currentWorkspace = hooks.useWorkspace();
  const settingsDialog = hooks.useWorkspaceSettingsDialog();

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (pageName) => () => {
    settingsDialog.open({ pageName });
    setAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handlePanelClick = (event) => {
    // Only toggles the panel with button not the whole div.
    // This prevents users from accidentally clicking
    // on the div when they're trying to click on the `+` icon in
    // order to create a new pipeline.

    const { nodeName, className } = event.target;
    const isSvg = nodeName === 'svg' || nodeName === 'path';

    // SVG elements also have `className`, but it's not a string 😳
    const isIcon =
      typeof className.includes === 'function' &&
      className.includes('MuiAccordionSummary-expandIcon');

    if (isSvg || isIcon) setIsExpanded(!isExpanded);
  };

  const handleAddButtonClick = (event) => {
    event.stopPropagation();
    setIsOpen(true);
  };

  if (!currentWorkspace) return null;

  const { name: workspaceName } = currentWorkspace;

  return (
    <StyledNavigator id="navigator">
      <div className="button-wrapper">
        <Button
          className="workspace-settings-menu"
          disableRipple
          onClick={handleMenuClick}
        >
          <span className="menu-name">{workspaceName}</span>
          <ExpandMoreIcon />
        </Button>
      </div>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        onClose={handleMenuClose}
        open={Boolean(anchorEl)}
      >
        <MenuItem
          className="settings"
          key={'settings'}
          onClick={handleMenuItemClick('settings')}
        >
          Settings
        </MenuItem>
      </Menu>

      <AddPipelineDialog isOpen={isOpen} setIsOpen={setIsOpen} />
      <StyledAccordion
        defaultExpanded={true}
        expanded={isExpanded}
        id="pipeline"
      >
        <AccordionSummary
          disableRipple
          expandIcon={
            <ExpandMoreIcon data-testid="pipeline-list-expand-button" />
          }
          onClick={handlePanelClick}
        >
          <Typography variant="h5">Pipelines</Typography>
          <AddIcon
            className="new-pipeline-button"
            data-testid="new-pipeline-button"
            onClick={handleAddButtonClick}
          />
        </AccordionSummary>
        <AccordionDetails>
          <div className="scrollbar-wrapper">
            <PipelineList />
          </div>
        </AccordionDetails>
      </StyledAccordion>
      <Outline isExpanded={isExpanded} pipelineApi={pipelineApi} />
      <WorkspaceSettings />
    </StyledNavigator>
  );
};

Navigator.propTypes = {
  pipelineApi: PropTypes.object,
};

export default Navigator;
