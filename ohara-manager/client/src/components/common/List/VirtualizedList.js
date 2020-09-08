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
import { noop, times } from 'lodash';
import styled, { css } from 'styled-components';
import Skeleton from '@material-ui/lab/Skeleton';

import { CellMeasurerCache } from 'react-virtualized/dist/commonjs/CellMeasurer';
import { List } from 'react-virtualized/dist/commonjs/List';
import { AutoSizer } from 'react-virtualized/dist/commonjs/AutoSizer';
import { CellMeasurer } from 'react-virtualized/dist/commonjs/CellMeasurer';

const StyledList = styled(List)(
  () => css`
    :focus {
      outline: none;
    }
  `,
);

const StyledLoader = styled.div(
  ({ theme }) => css`
    .MuiSkeleton-root {
      margin: ${theme.spacing(0.5, 0)};
    }
  `,
);

const Loader = () => {
  return (
    <StyledLoader>
      {times(30, (index) => (
        <Skeleton animation="wave" height="40" key={index} width="100%" />
      ))}
    </StyledLoader>
  );
};

const VirtualizedList = (props) => {
  const {
    isLoading,
    data,
    onRowClick,
    rowRenderer,
    autoScrollToBottom,
  } = props;
  // Avoid duplicate creation of the cache data. And so we only initialize the cache once for each DOM rendering
  const cache = React.useMemo(() => {
    return new CellMeasurerCache({
      defaultHeight: 20,
      fixedWidth: true,
    });
  }, []);

  const RowRendererWrapper = ({
    index,
    isScrolling,
    isVisible,
    key,
    parent,
    style,
  }) => (
    <CellMeasurer
      cache={cache}
      columnIndex={0}
      key={key}
      parent={parent}
      rowIndex={index}
    >
      {rowRenderer({
        index,
        isScrolling,
        isVisible,
        key,
        parent,
        onClick: () => onRowClick && onRowClick(data[index], index),
        rowData: data[index],
        style,
      })}
    </CellMeasurer>
  );

  RowRendererWrapper.propTypes = {
    index: PropTypes.number,
    isScrolling: PropTypes.bool,
    isVisible: PropTypes.bool,
    key: PropTypes.string,
    parent: PropTypes.any,
    style: PropTypes.object,
  };

  if (isLoading) return <Loader />;

  return (
    <AutoSizer onResize={() => cache.clearAll()}>
      {({ width, height }) => {
        return (
          <StyledList
            deferredMeasurementCache={cache}
            height={height}
            overscanRowCount={0}
            rowCount={data.length}
            rowHeight={cache.rowHeight}
            rowRenderer={RowRendererWrapper}
            scrollToIndex={autoScrollToBottom ? data.length : undefined}
            width={width}
          />
        );
      }}
    </AutoSizer>
  );
};

VirtualizedList.propTypes = {
  autoScrollToBottom: PropTypes.bool,
  data: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  onRowClick: PropTypes.func,
  rowRenderer: PropTypes.func.isRequired,
};

VirtualizedList.defaultProps = {
  autoScrollBottom: false,
  data: [],
  onRowClick: noop,
  isLoading: false,
};

export default VirtualizedList;
