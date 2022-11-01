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
      let x = value || 0;
      return String(x) + ' UAH';
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

String.prototype.escapeHTML = function () {
  return this.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default (props) => {
  const [columns] = useState([
    // { name: 'ID', title: 'ID' },
    {
      name: 'TITLE', title: 'Назва', getCellValue: row => {
        if (row['CLOSED'] == 'Y') {
          return '<s>' + row.TITLE + '</s>';
        }
        return row.TITLE;
      }
    },
    { name: 'OPPORTUNITY', title: 'Сума' },
    { name: 'UF_CRM_1644916042', title: '% здійснених оплат' },
    { name: 'STAGE_ID', title: 'Статус' },
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
    // { columnName: 'ID', width: 190 },
    { columnName: 'TITLE', wordWrapEnabled: true },
    { columnName: 'OPPORTUNITY', width: 190 },
    { columnName: 'UF_CRM_1644916042', width: 170 },
    { columnName: 'STAGE_ID', width: 200 },
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

  let outCats = [];

  Object.entries(cats).map(([name, rows]) => {
    outCats.push({
      name, rows
    });
  });

  outCats.sort(function (a, b) {
    if (a.name == 'ЗАКУПІВЛІ') return -1;
    return 0;
  });

  return (<>
    {outCats.map((cat, i) => (
      <>
        <Box mt={1}>
          <Typography>{cat.name}</Typography>
        </Box>
        <Paper>
          <Grid
            rows={cat.rows}
            columns={columns}
            width={"100%"}
          >
            <TreeDataState expandedRowIds={[...Array(99999).keys()]} />
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
              width="100%"
              rowComponent={TableRow}
            />
            {!i && <TableHeaderRow />}
            <TableTreeColumn
              for="TITLE"
              contentComponent={({ children }) => {
                return <><div dangerouslySetInnerHTML={{ __html: children }}></div></>
              }}
            />
          </Grid>
        </Paper></>
    ))
    }</>
  );
};
