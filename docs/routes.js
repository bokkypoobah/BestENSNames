const routes = [{
    path: '/config',
    component: Config,
    name: 'Config',
  // }, {
  //   path: '/mappings',
  //   component: Mappings,
  //   name: 'Mappings',
  // }, {
  //   path: '/account',
  //   component: Account,
  //   name: 'Account',
  }, {
    path: '/owners',
    component: Owners,
    name: 'Owners',
  }, {
    path: '/offers',
    component: Offers,
    name: 'Offers',
  }, {
    path: '/listings',
    component: Listings,
    name: 'Listings',
  }, {
    path: '/sales',
    component: Sales,
    name: 'Sales',
  }, {
    path: '/names',
    component: Names,
    name: 'Names',
  }, {
    path: '/tokens',
    component: Tokens,
    name: 'Tokens',
  }, {
    path: '/collections',
    component: Collections,
    name: 'Collections',
  }, {
    path: '/erc721s',
    component: ERC721s,
    name: 'ERC721s',
  }, {
    path: '/erc20s',
    component: ERC20s,
    name: 'ERC20s',
  }, {
    path: '/stealthtransfers',
    component: StealthTransfers,
    name: 'StealthTransfers',
  }, {
    path: '/registry',
    component: Registry,
    name: 'Registry',
  }, {
    path: '/addresses',
    component: Addresses,
    name: 'Addresses',
  // }, {
  //   path: '/assets',
  //   component: Assets,
  //   name: 'Assets',
  // }, {
  //   path: '/report/:contractOrTxOrBlockRange?',
  //   component: Report,
  //   name: 'Report',
  //   props: true,
  // }, {
  //   path: '/transactions',
  //   component: Transactions,
  //   name: 'Transactions',
  }, {
    path: '/data',
    component: Data,
    name: 'Data',
  // }, {
  //   path: '/docs/:section/:topic',
  //   component: Docs,
  //   name: 'Docs',
  }, {
    path: '*',
    component: Welcome,
    name: ''
  }
];
