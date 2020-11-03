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

import React, { memo } from 'react';
import { map, times } from 'lodash';
import Skeleton from '@material-ui/lab/Skeleton';
import Box from '@material-ui/core/Box';

interface LogViewerProps {
  logs: string[];
  loading?: boolean;
}

const LogViewer: React.FC<LogViewerProps> = (props) => {
  const { logs = [], loading = true } = props;

  if (loading) {
    return (
      <Box height="100%" overflow="hidden">
        {times(30, (index) => (
          <Skeleton animation="wave" height="40" key={index} width="100%" />
        ))}
      </Box>
    );
  }

  return (
    <Box
      data-testid="logs"
      display="flex"
      flexDirection="column-reverse"
      height="100%"
      ml={1}
      overflow="auto"
    >
      <Box flexGrow={1} key={-1} />
      {map(logs.reverse(), (log: string, index: number) => {
        return (
          <Box data-testid="log" key={index}>
            {log}
          </Box>
        );
      })}
    </Box>
  );
};

export default memo(LogViewer);
