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
import StorageIcon from '@material-ui/icons/Storage';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import { partition } from 'lodash';

import NodeList from './NodeList';
import NodeErrorDialog from './NodeErrorDialog';

const NodePanel = (props) => {
  const { tasksStatus = [] } = props;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentError, setCurrentError] = useState(null);
  const [coordinatorNodes, followerNodes] = partition(
    tasksStatus,
    (node) => node.coordinator,
  );

  const handleOpenErrorDialog = (error) => () => {
    setIsOpen(true);
    setCurrentError(error);
  };

  if (tasksStatus.length === 0) return null;
  return (
    <>
      <Accordion
        data-testid="nodes-panel"
        defaultExpanded={true}
        expanded={isExpanded}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          onClick={() => setIsExpanded((prevState) => !prevState)}
        >
          <StorageIcon fontSize="small" />
          <Typography className="section-title" variant="h5">
            Nodes
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <NodeList
            heading={`Coordinators (${coordinatorNodes.length})`}
            list={coordinatorNodes}
            onErrorTextClick={handleOpenErrorDialog}
          />
          <NodeList
            heading={`Followers (${followerNodes.length})`}
            list={followerNodes}
            onErrorTextClick={handleOpenErrorDialog}
          />
        </AccordionDetails>
      </Accordion>

      <NodeErrorDialog
        error={currentError}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

NodePanel.propTypes = {
  tasksStatus: PropTypes.arrayOf(
    PropTypes.shape({
      coordinator: PropTypes.bool.isRequired,
    }),
  ),
};

export default NodePanel;
