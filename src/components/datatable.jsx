import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
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
import { DataTypeProvider } from '@devexpress/dx-react-grid';
import JSONPretty from 'react-json-pretty';

const getChildRows = (row, rootRows) => (row ? row.items : rootRows);

const STAGE_IDProvider = props => (
  <DataTypeProvider
    formatterComponent={({ value }) => {
      let el = props.stages.find(c => c.STATUS_ID === value);
      if (el) return el['NAME'];
      return '-';
    }}
    {...props}
  />
);


const OPPORTUNITYProvider = props => (
  <DataTypeProvider
    formatterComponent={({ value }) => {
      return value + ' UAH';
    }}
    {...props}
  />
);

const PercentProvider = props => (
  <DataTypeProvider
    formatterComponent={({ value }) => {
      return value + ' %';
    }}
    {...props}
  />
);
const TableRow = ({ row, ...restProps }) => {
  return <Table.Row
    {...restProps}
    onClick={() => BX24.openPath(`/crm/deal/details/${row.ID}/`)}
    style={{
      cursor: 'pointer',
    }}
  />
};

const HighlightedCell = ({ value, style, ...restProps }) => (
  <Table.Cell
    {...restProps}
  >
    {restProps.row['CLOSED'] == 'Y' ? <><s>{value}</s></> : <>{value}</>}
  </Table.Cell>
);

const Cell = (props) => {
  const { column } = props;
  if (column.name === 'TITLE') {
    return <HighlightedCell {...props} />;
  }
  return <Table.Cell {...props} />;
};

export default (props) => {
  const [columns] = useState([
    { name: 'ID', title: 'ID' },
    { name: 'TITLE', title: 'Назва' },
    { name: 'STAGE_ID', title: 'Статус' },
    { name: 'OPPORTUNITY', title: 'Сума' },
    { name: 'UF_CRM_1644916042', title: '% здійснених оплат' },
    {
      name: 'ASSIGNED_BY_ID', title: 'Відповідальний',
      getCellValue: row => {
        let user = props.users[row['ASSIGNED_BY_ID']];
        let { LAST_NAME, SECOND_NAME, NAME } = user;
        LAST_NAME = LAST_NAME != null ? LAST_NAME + ' ' : '';
        SECOND_NAME = SECOND_NAME != null ? SECOND_NAME + ' ' : '';
        NAME = NAME != null ? NAME + ' ' : '';
        return `${LAST_NAME}${SECOND_NAME}${NAME}`;
      }
    },
  ]);
  const [tableColumnExtensions] = useState([
    { columnName: 'ID', width: 190 },
    { columnName: 'TITLE', width: 400 },
    { columnName: 'STAGE_ID', width: 200 },
    { columnName: 'OPPORTUNITY', width: 190 },
    { columnName: 'UF_CRM_1644916042', width: 170 },
    { columnName: 'ASSIGNED_BY_ID', width: 200 },
  ]);

  const [cats, setCats] = useState({});
  const [stageColumn] = useState(['STAGE_ID']);
  const [opportunityColumn] = useState(['OPPORTUNITY']);
  const [percentColumn] = useState(['UF_CRM_1644916042']);

  useEffect(() => {
    let c = {};
    props.data.map((deal) => {
      let cat = props.categories.find(c => c.ID == deal['CATEGORY_ID']);
      cat = cat ? cat['NAME'] : '';
      if (!(cat in c)) {
        c[cat] = [];
      }
      c[cat].push(deal);
    });
    setCats(c);
  }, []);

  return (<>
    {Object.entries(cats).map(([cat, val], i) => (
      <>
        <Box mt={1}>
          <Typography>{cat}</Typography>
        </Box>
        <Paper>
          <Grid
            rows={val}
            columns={columns}
          >
            <TreeDataState expandedRowIds={[...Array(50).keys()]} />
            <CustomTreeData
              getChildRows={getChildRows}
            />
            <STAGE_IDProvider
              for={stageColumn}
              stages={props.stages}
            />
            <PercentProvider
              for={percentColumn}
            />
            <OPPORTUNITYProvider
              for={opportunityColumn}
            />
            <Table
              columnExtensions={tableColumnExtensions}
              cellComponent={Cell}
              rowComponent={TableRow}
            />
            <TableHeaderRow />
            <TableTreeColumn
              for="ID"
            />
          </Grid>
        </Paper></>
    ))}</>
  );
};
