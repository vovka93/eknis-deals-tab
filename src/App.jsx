import { useEffect, useState } from 'react'
import { Box, Typography } from '@mui/material';
import './App.css'
import Datatable from './components/datatable';
import JSONPretty from 'react-json-pretty';

var nPageSize = 50;
var select = ['ID', 'TITLE', 'OPPORTUNITY', 'ASSIGNED_BY_ID', 'UF_CRM_1616671647', 'UF_CRM_1625039793', 'UF_CRM_1625041137', 'UF_CRM_1616674593', 'STAGE_ID', "CATEGORY_ID", 'CLOSED', 'CURRENCY_ID', 'UF_CRM_1644916042'];

var BX24 = window.BX24 || {
  callMethod: (method, params = {}, callback) => {
    let result = {};
    switch (method) {
      case 'profile':
        result = {
          "ID": "396",
          "ADMIN": true,
          "NAME": "Оплати від Замовників",
          "LAST_NAME": "",
          "PERSONAL_GENDER": "",
          "TIME_ZONE": "",
          "TIME_ZONE_OFFSET": 10800
        };
        break;
      case 'crm.deal.get':
        break;
      default:
        result = {

        };
    }
    callback({
      error: () => { },
      data: () => {
        return result;
      }
    });
  },
  placement: {
    info: () => {
      return {
        "placement": "CRM_DEAL_DETAIL_TAB",
        "options": {
          "ID": "8366"
        }
      };
    }
  }
}

function getDealList(ids) {
  return new Promise((resolve, reject) => {
    BX24.callMethod('crm.deal.list', {
      filter:
      {
        ID: ids
      },
      select,
    }, res => {
      if (res.error())
        reject(res.error());
      else
        resolve(res.data());
    });
  });
}

function getDeal(id) {
  return new Promise((resolve, reject) => {
    BX24.callMethod('crm.deal.get', { id: id }, res => {
      if (res.error())
        reject(res.error());
      else
        resolve(res.data());
    })
  });
}

function getCategoryList() {
  return new Promise((resolve, reject) => {
    BX24.callMethod('crm.dealcategory.list', {}, res => {
      if (res.error())
        reject(res.error());
      else
        resolve(res.data());
    });
  });
}

const openInNewTab = url => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

// UF_CRM_1616671647 Посилання на угоду закупівлі
// UF_CRM_1625041137 Посилання на локальну заявку (закуп. матеріалів)

// UF_CRM_1644916042 %

function loadItems(deal) {
  return new Promise(async (resolve, reject) => {
    let ids = [...deal.UF_CRM_1616671647, ...deal.UF_CRM_1625041137];
    if (ids.length) {
      getDealList(ids).then(async list => {
        resolve(await Promise.all(list.map(async (deal) => {
          deal.items = await loadItems(deal);
          return deal;
        })));
      }, reject);
    } else {
      resolve(undefined);
    }
  });
}

function findUsers(dealList) {
  let users = [];
  dealList.map(deal => {
    if (deal['ASSIGNED_BY_ID'])
      users = [...users, deal['ASSIGNED_BY_ID']]
    if (deal.items)
      users = [...users, ...findUsers(deal.items)];
  });
  return [...new Set(users)];
}

function getStagesList() {
  return new Promise((resolve, reject) => {
    BX24.callMethod('crm.status.list', {}, res => {
      if (res.error())
        reject(res.error());
      else
        resolve(res.data());
    });
  });
}

function App() {
  const [user, setUser] = useState({});
  const [userList, setUserList] = useState([]);
  const [users, setUsers] = useState();
  const [dealID, setDealID] = useState(0);
  const [isBatch, setIsBatch] = useState(false);
  const [deal, setDeal] = useState();
  const [placementInfo, setPlacementInfo] = useState({});
  const [deals, setDeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stages, setStages] = useState([]);

  useEffect(() => {
    BX24.callMethod('profile', {}, (res) => {
      setUser(res.data());
    });
    setPlacementInfo(BX24.placement.info());
    getCategoryList().then(setCategories);
    getStagesList().then(setStages);
  }, []);

  useEffect(() => {
    if (placementInfo.placement) {
      if (placementInfo.placement == 'CRM_DEAL_DETAIL_TAB') {
        setDealID(placementInfo.options.ID);
      }
    }
  }, [placementInfo?.placement]);

  useEffect(() => {
    if (dealID) {
      getDeal(dealID).then(async (deal) => {
        console.log(deal)
        let list = await loadItems(deal);
        setDeals(list);
      });
      // BX24.callMethod(
      //   "crm.deal.fields",
      //   {},
      //   function (result) {
      //     if (result.error())
      //       console.error(result.error());
      //     else
      //       console.dir(result.data());
      //   }
      // );
    }
  }, [dealID]);

  useEffect(() => {
    if (deals.length) {
      setUserList(findUsers([...deals]));
    }
  }, [deals.length]);

  useEffect(() => {
    if (userList.length && !isBatch) {
      let batch = {};
      let ids = [];
      userList.map(id => {
        ids.push(id)
        batch[id] = [
          'user.get', {
            id
          }
        ];
      });
      BX24.callBatch(batch, (result) => {
        let allUsers = {};
        ids.map(id => {
          if (result[id]) {
            if (typeof result[id].data === 'function') {
              let data = result[id].data();
              if (data) {
                allUsers[id] = data.pop();
              }
            }
          }
        });
        setIsBatch(true);
        setUsers(allUsers);
      });
    }
  }, [userList?.length]);

  return (
    <>
      <Typography variant="h6" gutterBottom>Пов'язані угоди</Typography>
      <Box sx={{ height: '1024px', width: '100%' }}>
        {categories.length && deals.length && users ? <Datatable data={deals} {...{ categories }} {...{ stages }} users={users} /> : <Typography>Не знайдено</Typography>}
      </Box>
    </>
  )
}

export default App
