import React, { useState } from 'react';
import Paper from '@mui/material/Paper';
import {
  TreeDataState,
  CustomTreeData,
} from '@devexpress/dx-react-grid';
import {
  Grid,
  Table,
  TableHeaderRow,
  TableTreeColumn,
} from '@devexpress/dx-react-grid-material-ui';

import {
  generateRows,
  defaultColumnValues,
} from '../demo-data/generator';
import JSONPretty from 'react-json-pretty';
const getChildRows = (row, rootRows) => (row ? row.items : rootRows);

export default () => {
  const [columns] = useState([
    { name: 'name', title: 'Name' },
    { name: 'gender', title: 'Gender' },
    { name: 'city', title: 'City' },
    { name: 'car', title: 'Car' },
  ]);
  const [data] = useState(generateRows({
    columnValues: {
      ...defaultColumnValues,
      items: ({ random }) => (random() > 0.5
        ? generateRows({
          columnValues: {
            ...defaultColumnValues,
            items: () => (random() > 0.5
              ? generateRows({
                columnValues: {
                  ...defaultColumnValues,
                },
                length: Math.trunc(random() * 5) + 1,
                random,
              })
              : null),
          },
          length: Math.trunc(random() * 3) + 1,
          random,
        })
        : null),
    },
    length: 3,
  }));
  const [tableColumnExtensions] = useState([
    { columnName: 'name', width: 300 },
  ]);

  return (<>
    <Paper>
      <JSONPretty data={data}></JSONPretty>
      <Grid
        rows={data}
        columns={columns}
      >
        <TreeDataState />
        <CustomTreeData
          getChildRows={getChildRows}
        />
        <Table
          columnExtensions={tableColumnExtensions}
        />
        <TableHeaderRow />
        <TableTreeColumn
          for="name"
        />
      </Grid>
    </Paper></>
  );
};
