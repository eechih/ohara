import React, { memo } from 'react';
import { forEachRight, map, times } from 'lodash';
import Skeleton from '@material-ui/lab/Skeleton';
import Box from '@material-ui/core/Box';

interface LogViewerProps {
  logs: string[];
  loading?: boolean;
}

function reverse(logs: string[]): string[] {
  const reverseLogs: string[] = [];
  forEachRight(logs, (log: string) => {
    reverseLogs.push(log);
  });
  return reverseLogs;
}

const LogViewer: React.FC<LogViewerProps> = (props) => {
  const { logs = [], loading = true } = props;
  const reverseLogs = reverse(logs);

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
      {map(reverseLogs, (log: string, index: number) => {
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
