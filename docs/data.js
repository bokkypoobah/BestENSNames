const Data = {
  template: `
  <div>
    <b-button v-b-toggle.data-module size="sm" block variant="outline-info">Data</b-button>
    <b-collapse id="data-module" visible class="my-2">
      <b-card no-body class="border-0">
        <b-row>
          <b-col cols="5" class="small px-1 text-right">Addresses:</b-col>
          <b-col class="small px-1 truncate" cols="7">{{ Object.keys(addresses).length }}</b-col>
        </b-row>
        <b-row>
          <b-col cols="5" class="small px-1 text-right">ERC-20 Contracts:</b-col>
          <b-col class="small px-1 truncate" cols="7">{{ totalERC20Contracts }}</b-col>
        </b-row>
        <b-row>
          <b-col cols="5" class="small px-1 text-right">ERC-721 Tokens:</b-col>
          <b-col class="small px-1 truncate" cols="7">{{ totalERC721Tokens }}</b-col>
        </b-row>
        <b-row>
          <b-col cols="5" class="small px-1 text-right">Registry:</b-col>
          <b-col class="small px-1 truncate" cols="7">{{ Object.keys(registry[chainId] || {}).length }}</b-col>
        </b-row>
        <b-row>
          <b-col cols="5" class="small px-1 text-right">Stealth Transfers:</b-col>
          <b-col class="small px-1 truncate" cols="7">{{ totalStealthTransfers }}</b-col>
        </b-row>
        <!-- <b-row>
          <b-col cols="5" class="small px-1">ENS Map</b-col>
          <b-col class="small px-1 truncate" cols="7">{{ Object.keys(ensMap).length }}</b-col>
        </b-row> -->
      </b-card>
    </b-collapse>
  </div>
  `,
  data: function () {
    return {
      count: 0,
      reschedule: true,
    }
  },
  computed: {
    powerOn() {
      return store.getters['connection/powerOn'];
    },
    coinbase() {
      return store.getters['connection/coinbase'];
    },
    chainId() {
      return store.getters['connection/chainId'];
    },
    addresses() {
      return store.getters['data/addresses'];
    },
    registry() {
      return store.getters['data/registry'];
    },
    stealthTransfers() {
      return store.getters['data/stealthTransfers'];
    },
    tokenContracts() {
      return store.getters['data/tokenContracts'];
    },
    totalStealthTransfers() {
      let result = (store.getters['data/forceRefresh'] % 2) == 0 ? 0 : 0;
      for (const [blockNumber, logIndexes] of Object.entries(this.stealthTransfers[this.chainId] || {})) {
        for (const [logIndex, item] of Object.entries(logIndexes)) {
          result++;
        }
      }
      return result;
    },
    totalERC20Contracts() {
      let result = (store.getters['data/forceRefresh'] % 2) == 0 ? 0 : 0;
      for (const [address, data] of Object.entries(this.tokenContracts[this.chainId] || {})) {
        if (data.type == "erc20") {
          result++;
        }
      }
      return result;
    },
    totalERC721Tokens() {
      let result = (store.getters['data/forceRefresh'] % 2) == 0 ? 0 : 0;
      for (const [address, data] of Object.entries(this.tokenContracts[this.chainId] || {})) {
        if (data.type == "erc721") {
          result += Object.keys(data.tokenIds).length;
        }
      }
      return result;
    },
    // mappings() {
    //   return store.getters['data/mappings'];
    // },
    // txs() {
    //   return store.getters['data/txs'];
    // },
    // assets() {
    //   return store.getters['data/assets'];
    // },
    // ensMap() {
    //   return store.getters['data/ensMap'];
    // },
  },
  methods: {
    async timeoutCallback() {
      logDebug("Data", "timeoutCallback() count: " + this.count);
      this.count++;
      var t = this;
      if (this.reschedule) {
        setTimeout(function() {
          t.timeoutCallback();
        }, 15000);
      }
    },
  },
  beforeDestroy() {
    logDebug("Data", "beforeDestroy()");
  },
  mounted() {
    logDebug("Data", "mounted() $route: " + JSON.stringify(this.$route.params));
    store.dispatch('config/restoreState');
    this.reschedule = true;
    logDebug("Data", "Calling timeoutCallback()");
    this.timeoutCallback();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const dataModule = {
  namespaced: true,
  state: {
    DB_PROCESSING_BATCH_SIZE: 10000,
    ENS_GRACE_PERIOD: 7776000, // TODO: Retrieve from 0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85 GRACE_PERIOD
    collections: {
      "1": {
        "0x0Ee24c748445Fb48028a74b0ccb6b46d7D3e3b33": {
          symbol: "NFB",
          name: "NAH FUNGIBLE BONES",
          type: "erc721",
        },
        "0x31385d3520bCED94f77AaE104b406994D8F2168C": {
          symbol: "BGANPUNKV2",
          name: "BASTARD GAN PUNKS V2",
          type: "erc721",
        },
        "0x8FA600364B93C53e0c71C7A33d2adE21f4351da3": {
          symbol: "LChads",
          name: "Larva Chads",
          type: "erc721",
        },
        "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D": {
          symbol: "BAYC",
          name: "BoredApeYachtClub",
          type: "erc721",
        },
        "0xBd3531dA5CF5857e7CfAA92426877b022e612cf8": {
          symbol: "PPG",
          name: "PudgyPenguins",
          type: "erc721",
        },
        "0xC2C747E0F7004F9E8817Db2ca4997657a7746928": {
          symbol: "HM",
          name: "Hashmasks",
          type: "erc721",
        },
        "0xc92cedDfb8dd984A89fb494c376f9A48b999aAFc": {
          symbol: "CREATURE",
          name: "Creature World",
          type: "erc721",
        },
      },
    },
    selectedCollection: null,
    idFilter: null,
    ownerFilter: null,
    showSideFilter: false,
    collection: {}, // contract, id, symbol, name, image, slug, creator, tokenCount
    tokens: {}, // chainId -> tokenId => { chainId, contract, tokenId, name, description, image, kind, isFlagged, isSpam, isNsfw, metadataDisabled, rarity, rarityRank, attributes
    timestamps: {}, // chainId -> blockNumber => timestamp
    txs: {}, // txHash => tx & txReceipt
    attributes: [],
    attributeFilter: {},
    owners: {},
    sales: [], //
    listings: [], //
    offers: [], //
    ens: {},

    addresses: {}, // Address => Info
    registry: {}, // Address => StealthMetaAddress
    stealthTransfers: {}, // ChainId, blockNumber, logIndex => data
    tokenContracts: {}, // ChainId, tokenContractAddress, tokenId => data
    tokenMetadata: {}, // ChainId, tokenContractAddress, tokenId => metadata
    ensMap: {},
    exchangeRates: {},
    forceRefresh: 0,
    sync: {
      section: null,
      total: null,
      completed: null,
      halt: false,
    },
    db: {
      name: "bestensnamesdata080a",
      version: 1,
      schemaDefinition: {
        // announcements: '[chainId+blockNumber+logIndex],[blockNumber+contract],contract,confirmations,stealthAddress',
        // registrations: '[chainId+blockNumber+logIndex],[blockNumber+contract],contract,confirmations',
        tokenEvents: '[chainId+blockNumber+logIndex],[blockNumber+contract],contract,confirmations',
        // tokens: '[chainId+contract+tokenId]',
        // sales: '[chainId+blockNumber+logIndex],contract,confirmations',
        // listings: '[chainId+contract+id],contract,maker,taker',
        // offers: '[chainId+contract+id],contract,maker,taker',
        cache: '&objectName',
      },
      updated: null,
    },
  },
  getters: {
    collections: state => state.collections,
    selectedCollection: state => state.selectedCollection,
    idFilter: state => state.idFilter,
    ownerFilter: state => state.ownerFilter,
    showSideFilter: state => state.showSideFilter,
    collection: state => state.collection,
    tokens: state => state.tokens,
    timestamps: state => state.timestamps,
    txs: state => state.txs,
    attributes: state => state.attributes,
    attributeFilter: state => state.attributeFilter,
    owners: state => state.owners,
    sales: state => state.sales,
    listings: state => state.listings,
    offers: state => state.offers,
    ens: state => state.ens,

    addresses: state => state.addresses,
    registry: state => state.registry,
    stealthTransfers: state => state.stealthTransfers,
    tokenContracts: state => state.tokenContracts,
    tokenMetadata: state => state.tokenMetadata,
    ensMap: state => state.ensMap,
    exchangeRates: state => state.exchangeRates,
    forceRefresh: state => state.forceRefresh,
    sync: state => state.sync,
    db: state => state.db,

    filteredTokens(state) {
      // logInfo("dataModule", "getters.filteredTokens");
      const chainId = store.getters['connection/chainId'];
      const attributes = state.attributes[chainId] && state.attributes[chainId][state.selectedCollection] || [];
      const attributeFilter = state.attributeFilter[chainId] && state.attributeFilter[chainId][state.selectedCollection] || {};
      const tokens = state.selectedCollection && state.tokens[chainId] && state.tokens[chainId][state.selectedCollection] || {};

      let filteredIds = null;
      if (state.idFilter) {
        const searchIds = state.idFilter.split(/[, \t\n]+/).map(s => s.trim());
        const ids = [];
        for (s of searchIds) {
          var range = s.match(/(\d+)-(\d+)/)
          if (range != null) {
            for (let i = parseInt(range[1]); i <= parseInt(range[2]); i++) {
              if (i >= 0 && i < 10000) {
                ids.push(i);
              }
            }
          } else if (s >= 0 && s < 10000) {
            ids.push(parseInt(s));
          } else {
            console.log("searchIds: " + JSON.stringify(searchIds, null, 2));
            // TODO: Fix loading first
            if (s.match(/[a-zA-Z0-9 \-]{3,}/)) {
              const searchFor = s.toLowerCase();
              console.log("searchFor: " + searchFor);
              console.log("attributeFilter: " + JSON.stringify(attributeFilter, null, 2));
              for (const [attributeType, attributeList] of Object.entries(attributeFilter)) {
                console.log(attributeType + " => " + JSON.stringify(attributeFilter, null, 2));
              }
          //     for (const attributeInfo of this.punkAttributesWithTokenIds) {
          //       for (const attribute of attributeInfo.attributeList) {
          //         if (attribute.attribute.indexOf(searchFor) == 0) {
          //           ids = [...new Set([...ids, ...attribute.punks])]
          //         }
          //       }
              // }
            }
          }
        }
        filteredIds = new Set(ids);
      }

      let ownerRegex = null;
      if (state.ownerFilter) {
        try {
          ownerRegex = new RegExp(state.ownerFilter, 'i');
        } catch (e) {
          console.log("filteredTokens - owner regex error: " + e.message);
          ownerRegex = new RegExp(/thequickbrowndogjumpsoverthelazyfox/, 'i');
        }
      }

      const results = [];
      if (Object.keys(attributeFilter).length == 0) {
        for (const [tokenId, token] of Object.entries(tokens)) {
          let include = true;
          if (filteredIds && !(filteredIds.has(parseInt(tokenId)))) {
            include = false;
          }
          if (include && ownerRegex) {
            const name = state.ens[token.owner] || null;
            if (!(ownerRegex.test(token.owner) || ownerRegex.test(name))) {
              include = false;
            }
          }
          if (include) {
            results.push({
              chainId: chainId,
              contract: state.selectedCollection,
              tokenId: tokenId,
              name: token.name || ('#' + token.tokenId),
              description: token.description,
              image: token.image,
              kind: token.kind,
              isFlagged: token.isFlagged,
              isSpam: token.isSpam,
              isNsfw: token.isNsfw,
              metadataDisabled: token.metadataDisabled,
              rarity: token.rarity,
              rarityRank: token.rarityRank,
              attributes: token.attributes,
              owner: token.owner,
              tags: token.tags,
            });
          }
        }
      } else {
        let selectedTokenIds = [];
        for (const [attributeType, attributeList] of Object.entries(attributeFilter)) {
          let thisAttributeTypeTokenIds = [];
          for (const attribute of Object.keys(attributeList)) {
            for (const attributeInfo of attributes) {
              if (attributeInfo.attributeType == attributeType) {
                const tokenIds = attributeInfo.attributeList.filter(e => e.attribute == attribute).map(e => e.tokenIds).flat();
                thisAttributeTypeTokenIds = [...thisAttributeTypeTokenIds, ...tokenIds];
                break;
              }
            }
          }
          if (selectedTokenIds.length == 0) {
            selectedTokenIds = thisAttributeTypeTokenIds;
          } else {
            selectedTokenIds = selectedTokenIds.filter(tokenId => thisAttributeTypeTokenIds.includes(tokenId));
          }
        }
        for (const tokenId of selectedTokenIds) {
          const token = chainId && state.selectedCollection && state.tokens[chainId][state.selectedCollection][tokenId] || {};
          let include = true;
          if (filteredIds && !(filteredIds.has(parseInt(tokenId)))) {
            include = false;
          }
          if (include && ownerRegex) {
            const name = state.ens[token.owner] || null;
            if (!(ownerRegex.test(token.owner) || ownerRegex.test(name))) {
              include = false;
            }
          }

          if (include) {
            results.push({
              chainId: chainId,
              contract: state.selectedCollection,
              tokenId: tokenId,
              name: token.name || ('#' + tokenId),
              description: token.description,
              image: token.image,
              kind: token.kind,
              isFlagged: token.isFlagged,
              isSpam: token.isSpam,
              isNsfw: token.isNsfw,
              metadataDisabled: token.metadataDisabled,
              rarity: token.rarity,
              rarityRank: token.rarityRank,
              attributes: token.attributes,
              owner: token.owner,
              tags: token.tags,
            });
          }
        }
      }
      // console.log("results: " + JSON.stringify(results.slice(0, 4), null, 2));
      return results;
    },

  },
  mutations: {
    setState(state, info) {
      // logInfo("dataModule", "mutations.setState - info: " + JSON.stringify(info, null, 2));
      Vue.set(state, info.name, info.data);
    },
    setSelectedCollection(state, selectedCollection) {
      Vue.set(state, 'selectedCollection', selectedCollection);
      // logInfo("dataModule", "mutations.setSelectedCollection: " + selectedCollection);
    },
    setIdFilter(state, idFilter) {
      Vue.set(state, 'idFilter', idFilter);
      logInfo("dataModule", "mutations.setIdFilter: " + idFilter);
    },
    setOwnerFilter(state, ownerFilter) {
      Vue.set(state, 'ownerFilter', ownerFilter);
      logInfo("dataModule", "mutations.setOwnerFilter: " + ownerFilter);
    },
    setShowSideFilter(state, show) {
      Vue.set(state, 'showSideFilter', show);
      logInfo("dataModule", "mutations.setShowSideFilter: " + show);
    },
    setCollection(state, collection) {
      Vue.set(state, 'collection', collection);
      // logInfo("dataModule", "mutations.setCollection - collection: " + JSON.stringify(collection, null, 2));
    },
    setTokens(state, tokens) {
      Vue.set(state, 'tokens', tokens);
      // logInfo("dataModule", "mutations.setTokens tokens: " + JSON.stringify(tokens, null, 2));
    },

    processTokenTransfer(state, transfer) {
      // logInfo("dataModule", "mutations.processTokenTransfer transfer: " + JSON.stringify(transfer, null, 2));
      // if (transfer.tokenId == "53835211818918528779359817553631021141919078878710948845228773628660104698081") {
      //   console.log("blockNumber: " + transfer.blockNumber + ", from: " + transfer.from.substring(0, 20) + ", to: " + transfer.to.substring(0, 20) + ", tokenId: " + transfer.tokenId.substring(0, 30));
      // }
      if (!(transfer.chainId in state.tokens)) {
        Vue.set(state.tokens, transfer.chainId, {});
      }
      if (!(transfer.contract in state.tokens[transfer.chainId])) {
        Vue.set(state.tokens[transfer.chainId], transfer.contract, {});
      }
      let tokenIds = [];
      if (transfer.eventType == "erc721" && transfer.type == "Transfer") {
        tokenIds = [transfer.tokenId];
      } else if (transfer.eventType == "erc1155" && transfer.type == "TransferSingle") {
        tokenIds = [transfer.tokenId];
      } else if (transfer.eventType == "erc1155" && transfer.type == "TransferBatch") {
        tokenIds = transfer.tokenIds;
      }
      for (let tokenId of tokenIds) {
        if (!(tokenId in state.tokens[transfer.chainId][transfer.contract])) {
          Vue.set(state.tokens[transfer.chainId][transfer.contract], tokenId, {
            name: null,
            description: null,
            created: null,
            registration: null,
            expiry: null,
            attributes: {},
            imageSource: null,
            image: null,
            owner: transfer.to,
            tags: [],
            history: [{
              blockNumber: transfer.blockNumber,
              logIndex: transfer.logIndex,
              from: transfer.from,
              to: transfer.to,
            }],
          });
        } else {
          const history = state.tokens[transfer.chainId][transfer.contract][tokenId].history;
          const lastBlockNumber = history[history.length - 1].blockNumber;
          const lastLogIndex = history[history.length - 1].logIndex;
          if ((transfer.blockNumber > lastBlockNumber)  || ((transfer.blockNumber == lastBlockNumber) && (transfer.logInfo > lastLogIndex))) {
            // console.log("lastBlockNumber: " + lastBlockNumber + " vs blockNumber: " + transfer.blockNumber);
            // console.log("lastLogIndex: " + lastLogIndex + " vs logIndex: " + transfer.logIndex);
            Vue.set(state.tokens[transfer.chainId][transfer.contract][tokenId], 'owner', transfer.to);
            history.push({
              blockNumber: transfer.blockNumber,
              logIndex: transfer.logIndex,
              from: transfer.from,
              to: transfer.to,
            });
            Vue.set(state.tokens[transfer.chainId][transfer.contract][tokenId], 'history', history);
          }
        }
      }
    },

    addTimestamp(state, info) {
      // logInfo("dataModule", "mutations.addTimestamp info: " + JSON.stringify(info, null, 2));
      if (!(info.chainId in state.timestamps)) {
        Vue.set(state.timestamps, info.chainId, {});
      }
      if (!(info.blockNumber in state.timestamps[info.chainId])) {
        Vue.set(state.timestamps[info.chainId], info.blockNumber, info.timestamp);
      }
    },

    addTx(state, tx) {
      // logInfo("dataModule", "mutations.addTimestamp tx: " + JSON.stringify(tx, null, 2));
      if (!(tx.chainId in state.txs)) {
        Vue.set(state.txs, tx.chainId, {});
      }
      if (!(tx.txHash in state.txs[tx.chainId])) {
        Vue.set(state.txs[tx.chainId], tx.txHash, tx);
      }
    },

    updateTokenMetadata(state, token) {
      logInfo("dataModule", "mutations.updateTokenMetadata token: " + JSON.stringify(token, null, 2));
      if (token.tokenId in state.tokens[token.chainId][token.contract]) {
        Vue.set(state.tokens[token.chainId][token.contract][token.tokenId], 'name', token.name);
        Vue.set(state.tokens[token.chainId][token.contract][token.tokenId], 'description', token.description);
        Vue.set(state.tokens[token.chainId][token.contract][token.tokenId], 'created', token.created);
        Vue.set(state.tokens[token.chainId][token.contract][token.tokenId], 'registration', token.registration);
        Vue.set(state.tokens[token.chainId][token.contract][token.tokenId], 'expiry', token.expiry);
        Vue.set(state.tokens[token.chainId][token.contract][token.tokenId], 'attributes', token.attributes);
        Vue.set(state.tokens[token.chainId][token.contract][token.tokenId], 'image', token.image);
        // logInfo("dataModule", "mutations.updateTokenMetadata token NEW: " + JSON.stringify(state.tokens[token.chainId][token.contract][token.tokenId], null, 2));
      }
    },

    addOrUpdateToken(state, token) {
      if (!(token.chainId in state.tokens)) {
        Vue.set(state.tokens, token.chainId, {});
      }
      if (!(token.contract in state.tokens[token.chainId])) {
        Vue.set(state.tokens[token.chainId], token.contract, {});
      }
      if (!(token.tokenId in state.tokens[token.chainId][token.contract])) {
        Vue.set(state.tokens[token.chainId][token.contract], token.tokenId, {
          name: token.name,
          description: token.description,
          image: token.image,
          kind: token.kind,
          isFlagged: token.isFlagged,
          isSpam: token.isSpam,
          isNsfw: token.isNsfw,
          metadataDisabled: token.metadataDisabled,
          rarity: token.rarity,
          rarityRank: token.rarityRank,
          attributes: token.attributes,
          owner: token.owner,
          tags: [],
        });
      } else {
        Vue.set(state.tokens[token.chainId][token.contract][token.tokenId], 'name', token.name);
        Vue.set(state.tokens[token.chainId][token.contract][token.tokenId], 'description', token.description);
        Vue.set(state.tokens[token.chainId][token.contract][token.tokenId], 'image', token.image);
        Vue.set(state.tokens[token.chainId][token.contract][token.tokenId], 'kind', token.kind);
        Vue.set(state.tokens[token.chainId][token.contract][token.tokenId], 'isFlagged', token.isFlagged);
        Vue.set(state.tokens[token.chainId][token.contract][token.tokenId], 'isSpam', token.isSpam);
        Vue.set(state.tokens[token.chainId][token.contract][token.tokenId], 'isNsfw', token.isNsfw);
        Vue.set(state.tokens[token.chainId][token.contract][token.tokenId], 'metadataDisabled', token.metadataDisabled);
        Vue.set(state.tokens[token.chainId][token.contract][token.tokenId], 'rarity', token.rarity);
        Vue.set(state.tokens[token.chainId][token.contract][token.tokenId], 'rarityRank', token.rarityRank);
        Vue.set(state.tokens[token.chainId][token.contract][token.tokenId], 'attributes', token.attributes);
        Vue.set(state.tokens[token.chainId][token.contract][token.tokenId], 'owner', token.owner);
        // Don't update user input tags[]
      }
    },
    saveTokenTag(state, info) {
      // logInfo("dataModule", "mutations.saveTokenTag info: " + JSON.stringify(info, null, 2));
      if (state.tokens[info.chainId] && state.tokens[info.chainId][info.contract] && state.tokens[info.chainId][info.contract][info.tokenId]) {
        Vue.set(state.tokens[info.chainId][info.contract][info.tokenId], 'tags', info.tags);
      }
    },
    setAttributes(state, attributes) {
      const chainId = store.getters['connection/chainId'];
      if (!(chainId in state.attributes)) {
        Vue.set(state.attributes, chainId, {});
      }
      if (!(state.selectedCollection in state.attributes[chainId])) {
        Vue.set(state.attributes[chainId], state.selectedCollection, attributes);
      }
      // logInfo("dataModule", "mutations.setAttributes attributes: " + JSON.stringify(attributes, null, 2));
    },
    setOwners(state, owners) {
      Vue.set(state, 'owners', owners);
      // logInfo("dataModule", "mutations.setOwners owners: " + JSON.stringify(owners, null, 2));
    },
    setSales(state, sales) {
      Vue.set(state, 'sales', sales);
      // logInfo("dataModule", "mutations.setSales sales: " + JSON.stringify(sales, null, 2));
    },
    setListings(state, listings) {
      Vue.set(state, 'listings', listings);
      // logInfo("dataModule", "mutations.setListings listings: " + JSON.stringify(listings, null, 2));
    },
    setOffers(state, offers) {
      Vue.set(state, 'offers', offers);
      // logInfo("dataModule", "mutations.setOffers offers: " + JSON.stringify(offers, null, 2));
    },
    setENS(state, info) {
      Vue.set(state.ens, info.address, info.name);
      // logInfo("dataModule", "mutations.setENS info: " + JSON.stringify(info, null, 2));
    },

    attributeFilterChanged(state, info) {
      const chainId = store.getters['connection/chainId'];
      if (!(chainId in state.attributeFilter)) {
        Vue.set(state.attributeFilter, chainId, {});
      }
      if (!(state.selectedCollection in state.attributeFilter[chainId])) {
        Vue.set(state.attributeFilter[chainId], state.selectedCollection, {});
      }
      if (!(info.type in state.attributeFilter[chainId][state.selectedCollection])) {
        Vue.set(state.attributeFilter[chainId][state.selectedCollection], info.type, {});
      }
      if (state.attributeFilter[chainId][state.selectedCollection][info.type][info.value]) {
        Vue.delete(state.attributeFilter[chainId][state.selectedCollection][info.type], info.value);
        if (Object.keys(state.attributeFilter[chainId][state.selectedCollection][info.type]) == 0) {
          Vue.delete(state.attributeFilter[chainId][state.selectedCollection], info.type);
        }
      } else {
        Vue.set(state.attributeFilter[chainId][state.selectedCollection][info.type], info.value, true);
      }
      // logInfo("dataModule", "mutations.attributeFilterChanged - state.attributeFilter: " + JSON.stringify(state.attributeFilter, null, 2));
    },

    toggleAddressField(state, info) {
      Vue.set(state.addresses[info.account], info.field, !state.addresses[info.account][info.field]);
      logInfo("dataModule", "mutations.toggleAddressField - accounts[" + info.account + "]." + info.field + " = " + state.addresses[info.account][info.field]);
    },
    setAddressField(state, info) {
      Vue.set(state.addresses[info.account], info.field, info.value);
      logInfo("dataModule", "mutations.setAddressField - accounts[" + info.account + "]." + info.field + " = " + state.addresses[info.account][info.field]);
    },
    toggleTokenContractFavourite(state, tokenContract) {
      const chainId = store.getters['connection/chainId'];
      Vue.set(state.tokenContracts[chainId][tokenContract.address], 'favourite', !state.tokenContracts[chainId][tokenContract.address].favourite);
      logInfo("dataModule", "mutations.toggleTokenContractFavourite - tokenContract: " + JSON.stringify(state.tokenContracts[chainId][tokenContract.address]));
    },
    toggleTokenContractJunk(state, tokenContract) {
      const chainId = store.getters['connection/chainId'];
      Vue.set(state.tokenContracts[chainId][tokenContract.address], 'junk', !state.tokenContracts[chainId][tokenContract.address].junk);
      logInfo("dataModule", "mutations.toggleTokenContractJunk - tokenContract: " + JSON.stringify(state.tokenContracts[chainId][tokenContract.address]));
    },

    addNewAddress(state, newAccount) {
      logInfo("dataModule", "mutations.addNewAddress(" + JSON.stringify(newAccount, null, 2) + ")");
      let address = null;
      let linkedToAddress = null;
      let type = null;
      let mine = false;
      let source = null;
      if (newAccount.action == "addCoinbase") {
        address = store.getters['connection/coinbase'];
        type = "address";
        mine = true;
        source = "attached";
      } else if (newAccount.action == "addAddress") {
        address = ethers.utils.getAddress(newAccount.address);
        type = "address";
        mine = newAccount.mine;
        source = "manual";
      } else if (newAccount.action == "addStealthMetaAddress") {
        address = newAccount.address;
        linkedToAddress = newAccount.linkedToAddress;
        type = "stealthMetaAddress";
        mine = newAccount.mine;
        source = "manual";
      } else {
        address = newAccount.address;
        linkedToAddress = newAccount.linkedToAddress;
        type = "stealthMetaAddress";
        mine = true;
        source = "attached";
      }
      console.log("address: " + address);
      console.log("linkedToAddress: " + linkedToAddress);
      console.log("type: " + type);
      if (address in state.addresses) {
        Vue.set(state.addresses[address], 'type', type);
        if (type == "stealthMetaAddress") {
          Vue.set(state.addresses[address], 'linkedToAddress', linkedToAddress);
          Vue.set(state.addresses[address], 'phrase', newAccount.action == "generateStealthMetaAddress" ? newAccount.phrase : undefined);
          Vue.set(state.addresses[address], 'viewingPrivateKey', newAccount.action == "generateStealthMetaAddress" ? newAccount.viewingPrivateKey : undefined);
          Vue.set(state.addresses[address], 'spendingPublicKey', newAccount.action == "generateStealthMetaAddress" ? newAccount.spendingPublicKey : undefined);
          Vue.set(state.addresses[address], 'viewingPublicKey', newAccount.action == "generateStealthMetaAddress" ? newAccount.viewingPublicKey : undefined);
        }
        Vue.set(state.addresses[address], 'mine', mine);
        Vue.set(state.addresses[address], 'favourite', newAccount.favourite);
        Vue.set(state.addresses[address], 'name', newAccount.name);
      } else {
        if (type == "address") {
          Vue.set(state.addresses, address, {
            type,
            source,
            mine,
            junk: false,
            favourite: newAccount.favourite,
            name: newAccount.name,
            notes: null,
          });
        } else {
          Vue.set(state.addresses, address, {
            type,
            linkedToAddress,
            phrase: newAccount.action == "generateStealthMetaAddress" ? newAccount.phrase : undefined,
            viewingPrivateKey: newAccount.action == "generateStealthMetaAddress" ? newAccount.viewingPrivateKey : undefined,
            spendingPublicKey: newAccount.action == "generateStealthMetaAddress" ? newAccount.spendingPublicKey : undefined,
            viewingPublicKey: newAccount.action == "generateStealthMetaAddress" ? newAccount.viewingPublicKey : undefined,
            source,
            mine,
            junk: false,
            favourite: newAccount.favourite,
            name: newAccount.name,
            notes: null,
          });
        }
      }
      logInfo("dataModule", "mutations.addNewAddress AFTER - state.accounts: " + JSON.stringify(state.accounts, null, 2));
    },
    addNewStealthAddress(state, info) {
      logInfo("dataModule", "mutations.addNewStealthAddress: " + JSON.stringify(info, null, 2));
      Vue.set(state.addresses, info.stealthAddress, {
        type: info.type,
        linkedTo: info.linkedTo,
        source: info.source,
        mine: info.mine,
        junk: info.junk,
        favourite: info.favourite,
        name: info.name,
        notes: info.notes,
      });
    },
    updateToStealthAddress(state, info) {
      // logInfo("dataModule", "mutations.updateToStealthAddress: " + JSON.stringify(info, null, 2));
      Vue.set(state.addresses[info.stealthAddress], 'type', info.type);
      Vue.set(state.addresses[info.stealthAddress], 'linkedTo', info.linkedTo);
      Vue.set(state.addresses[info.stealthAddress], 'mine', info.mine);
    },
    deleteAddress(state, address) {
      Vue.delete(state.addresses, address);
    },
    setTokenMetadata(state, info) {
      // logInfo("dataModule", "mutations.setTokenMetadata info: " + JSON.stringify(info, null, 2));
      if (!(info.chainId in state.tokenMetadata)) {
        Vue.set(state.tokenMetadata, info.chainId, {});
      }
      if (!(info.address in state.tokenMetadata[info.chainId])) {
        Vue.set(state.tokenMetadata[info.chainId], info.address, {});
      }
      if (!(info.tokenId in state.tokenMetadata[info.chainId][info.address])) {
        Vue.set(state.tokenMetadata[info.chainId][info.address], info.tokenId, {
          name: info.name,
          description: info.description,
          expiry: info.expiry || undefined,
          attributes: info.attributes,
          imageSource: info.imageSource,
          image: info.image,
        });
      }
    },
    addStealthTransfer(state, info) {
      // logInfo("dataModule", "mutations.addStealthTransfer: " + JSON.stringify(info, null, 2));
      if (!(info.chainId in state.stealthTransfers)) {
        Vue.set(state.stealthTransfers, info.chainId, {});
      }
      if (!(info.blockNumber in state.stealthTransfers[info.chainId])) {
        Vue.set(state.stealthTransfers[info.chainId], info.blockNumber, {});
      }
      if (!(info.logIndex in state.stealthTransfers[info.chainId][info.blockNumber])) {
        Vue.set(state.stealthTransfers[info.chainId][info.blockNumber], info.logIndex, info);
      }
    },

    setExchangeRates(state, exchangeRates) {
      // const dates = Object.keys(exchangeRates);
      // dates.sort();
      // for (let date of dates) {
      //   console.log(date + "\t" + exchangeRates[date]);
      // }
      Vue.set(state, 'exchangeRates', exchangeRates);
    },
    forceRefresh(state) {
      Vue.set(state, 'forceRefresh', parseInt(state.forceRefresh) + 1);
      logInfo("dataModule", "mutations.forceRefresh: " + state.forceRefresh);
    },
    saveTxTags(state, info) {
      if (!(info.txHash in state.txsInfo)) {
        Vue.set(state.txsInfo, info.txHash, {
          tags: info.tags,
        });
      } else {
        Vue.set(state.txsInfo[info.txHash], 'tags', info.tags);
      }
    },
    addTagToTxs(state, info) {
      for (const txHash of Object.keys(info.txHashes)) {
        if (!(txHash in state.txsInfo)) {
          Vue.set(state.txsInfo, txHash, {
            tags: [info.tag],
          });
        } else {
          const currentTags = state.txsInfo[txHash].tags || [];
          if (!currentTags.includes(info.tag)) {
            currentTags.push(info.tag);
            Vue.set(state.txsInfo[txHash], 'tags', currentTags);
          }
        }
      }
    },
    removeTagFromTxs(state, info) {
      for (const txHash of Object.keys(info.txHashes)) {
        if (txHash in state.txsInfo) {
          const currentTags = state.txsInfo[txHash].tags || [];
          if (currentTags.includes(info.tag)) {
            const newTags = currentTags.filter(e => e != info.tag);
            if (newTags.length == 0 && Object.keys(state.txsInfo[txHash]).length == 1) {
              Vue.delete(state.txsInfo, txHash);
            } else {
              Vue.set(state.txsInfo[txHash], 'tags', newTags);
            }
          }
        }
      }
    },
    setSyncSection(state, info) {
      logInfo("dataModule", "mutations.setSyncSection info: " + JSON.stringify(info));
      state.sync.section = info.section;
      state.sync.total = info.total;
    },
    setSyncCompleted(state, completed) {
      logInfo("dataModule", "mutations.setSyncCompleted completed: " + completed);
      state.sync.completed = completed;
    },
    setSyncHalt(state, halt) {
      // logInfo("dataModule", "mutations.setSyncHalt halt: " + halt);
      state.sync.halt = halt;
    },
  },
  actions: {
    async restoreState(context) {
      logInfo("dataModule", "actions.restoreState");
      if (Object.keys(context.state.stealthTransfers).length == 0) {
        const db0 = new Dexie(context.state.db.name);
        db0.version(context.state.db.version).stores(context.state.db.schemaDefinition);
        for (let type of ['addresses', 'timestamps', 'txs', 'tokens' /*, 'attributeFilter', 'selectedCollection', 'idFilter', 'ownerFilter', 'collections', 'showSideFilter', 'collection', 'tokens', 'attributes', 'owners', 'sales', 'listings', 'offers', 'ens' */]) {
          const data = await db0.cache.where("objectName").equals(type).toArray();
          if (data.length == 1) {
            // logInfo("dataModule", "actions.restoreState " + type + " => " + JSON.stringify(data[0].object));
            context.commit('setState', { name: type, data: data[0].object });
          }
        }
      }
    },
    async saveData(context, types) {
      // logInfo("dataModule", "actions.saveData - types: " + JSON.stringify(types));
      const db0 = new Dexie(context.state.db.name);
      db0.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      for (let type of types) {
        await db0.cache.put({ objectName: type, object: context.state[type] }).then (function() {
        }).catch(function(error) {
          console.log("error: " + error);
        });
      }
      db0.close();
    },

    async attributeFilterChanged(context, info) {
      // logInfo("dataModule", "actions.attributeFilterChanged - info: " + JSON.stringify(info));
      await context.commit('attributeFilterChanged', info);
      await context.dispatch('saveData', ['attributeFilter']);
    },

    async setSelectedCollection(context, selectedCollection) {
      // logInfo("dataModule", "actions.setSelectedCollection: " + selectedCollection);
      await context.commit('setSelectedCollection', selectedCollection);
      await context.dispatch('saveData', ['selectedCollection']);
    },

    async setIdFilter(context, idFilter) {
      logInfo("dataModule", "actions.setIdFilter: " + idFilter);
      await context.commit('setIdFilter', idFilter);
      await context.dispatch('saveData', ['idFilter']);
    },
    async setOwnerFilter(context, ownerFilter) {
      logInfo("dataModule", "actions.setOwnerFilter: " + ownerFilter);
      await context.commit('setOwnerFilter', ownerFilter);
      await context.dispatch('saveData', ['ownerFilter']);
    },
    async setShowSideFilter(context, show) {
      logInfo("dataModule", "actions.setShowSideFilter: " + show);
      await context.commit('setShowSideFilter', show);
      await context.dispatch('saveData', ['showSideFilter']);
    },
    async saveTokenTag(context, info) {
      logInfo("dataModule", "actions.saveTokenTag: " + JSON.stringify(info));
      await context.commit('saveTokenTag', info);
      await context.dispatch('saveData', ['tokens']);
    },

    async toggleAddressField(context, info) {
      // logInfo("dataModule", "actions.toggleAddressField - info: " + JSON.stringify(info));
      await context.commit('toggleAddressField', info);
      await context.dispatch('saveData', ['addresses']);
    },
    async setAddressField(context, info) {
      // logInfo("dataModule", "actions.setAddressField - info: " + JSON.stringify(info));
      await context.commit('setAddressField', info);
      await context.dispatch('saveData', ['addresses']);
    },
    async toggleTokenContractFavourite(context, tokenContract) {
      // logInfo("dataModule", "actions.toggleTokenContractFavourite - info: " + JSON.stringify(info));
      await context.commit('toggleTokenContractFavourite', tokenContract);
      await context.dispatch('saveData', ['tokenContracts']);
    },
    async toggleTokenContractJunk(context, tokenContract) {
      logInfo("dataModule", "actions.toggleTokenContractJunk - tokenContract: " + JSON.stringify(tokenContract));
      await context.commit('toggleTokenContractJunk', tokenContract);
      await context.dispatch('saveData', ['tokenContracts']);
    },
    async setTokenMetadata(context, info) {
      logInfo("dataModule", "actions.addNewAddress - info: " + JSON.stringify(info, null, 2));
      context.commit('setTokenMetadata', info);
      await context.dispatch('saveData', ['tokenContracts']);
    },

    async deleteAddress(context, account) {
      await context.commit('deleteAddress', account);
      await context.dispatch('saveData', ['addresses']);
    },
    async saveTxTags(context, info) {
      await context.commit('saveTxTags', info);
      await context.dispatch('saveData', ['txsInfo']);
    },
    async addTagToTxs(context, info) {
      await context.commit('addTagToTxs', info);
      await context.dispatch('saveData', ['txsInfo']);
    },
    async removeTagFromTxs(context, info) {
      await context.commit('removeTagFromTxs', info);
      await context.dispatch('saveData', ['txsInfo']);
    },
    async refreshTokenMetadata(context, token) {
      console.log("actions.refreshTokenMetadata - token: " + JSON.stringify(token));
      const url = "https://api.reservoir.tools/tokens/v5?tokens=" + token.contract + ":" + token.tokenId;
      console.log(url);
      const data = await fetch(url).then(response => response.json());
      if (data.tokens) {
        for (let record of data.tokens) {
          context.commit('updateAccountToken', record.token);
        }
      }
      await context.dispatch('saveData', ['accounts']);
    },
    async setSyncHalt(context, halt) {
      // logInfo("dataModule", "actions.setSyncHalt: " + halt);
      context.commit('setSyncHalt', halt);
    },
    async resetTokens(context) {
      await context.commit('resetTokens');
      await context.dispatch('saveData', ['accounts']);
    },
    async resetData(context) {
      logInfo("dataModule", "actions.resetData");
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      await db.announcements.clear();
      await db.cache.clear();
      await db.registrations.clear();
      await db.tokenEvents.clear();
      db.close();
    },
    async addNewAddress(context, newAddress) {
      logInfo("dataModule", "actions.addNewAddress - newAddress: " + JSON.stringify(newAddress, null, 2) + ")");
      context.commit('addNewAddress', newAddress);
      await context.dispatch('saveData', ['addresses']);
    },
    // async restoreAccount(context, addressData) {
    //   logInfo("dataModule", "actions.restoreAccount - addressData: " + JSON.stringify(addressData));
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   const ensReverseRecordsContract = new ethers.Contract(ENSREVERSERECORDSADDRESS, ENSREVERSERECORDSABI, provider);
    //   const accountInfo = await getAccountInfo(addressData.account, provider)
    //   if (accountInfo.account) {
    //     context.commit('addNewAddress', accountInfo);
    //     context.commit('addNewAccountInfo', addressData);
    //   }
    //   const names = await ensReverseRecordsContract.getNames([addressData.account]);
    //   const name = names.length == 1 ? names[0] : addressData.account;
    //   if (!(addressData.account in context.state.ensMap)) {
    //     context.commit('addENSName', { account: addressData.account, name });
    //   }
    // },
    // async restoreIntermediateData(context, info) {
    //   if (info.blocks && info.txs) {
    //     await context.commit('setState', { name: 'blocks', data: info.blocks });
    //     await context.commit('setState', { name: 'txs', data: info.txs });
    //   }
    // },
    async syncIt(context, options) {
      logInfo("dataModule", "actions.syncIt - options: " + JSON.stringify(options));
      // const db = new Dexie(context.state.db.name);
      // db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const block = await provider.getBlock();
      const confirmations = store.getters['config/settings'].confirmations && parseInt(store.getters['config/settings'].confirmations) || 10;
      const blockNumber = block && block.number || null;
      const cryptoCompareAPIKey = store.getters['config/settings'].cryptoCompareAPIKey && store.getters['config/settings'].cryptoCompareAPIKey.length > 0 && store.getters['config/settings'].cryptoCompareAPIKey || null;
      // const processFilters = store.getters['config/processFilters'];

      const accountsToSync = [];
      // for (const [account, addressData] of Object.entries(context.state.accounts)) {
      //   const accountsInfo = context.state.accountsInfo[account] || {};
      //   if ((info.parameters.length == 0 && accountsInfo.sync) || info.parameters.includes(account)) {
      //       accountsToSync.push(account);
      //   }
      // }
      const chainId = store.getters['connection/chainId'];
      const coinbase = store.getters['connection/coinbase'];
      if (!(coinbase in context.state.addresses) && Object.keys(context.state.addresses).length == 0) {
        context.commit('addNewAddress', { action: "addCoinbase" });
        await context.dispatch('saveData', ['addresses']);
      }

      const parameter = { chainId, coinbase, blockNumber, confirmations, cryptoCompareAPIKey, ...options };

      if ((options.erc721Events || options.erc1155Events) && !options.devThing) {
        await context.dispatch('syncENSEvents', parameter);
      }

      if (options.timestamps && !options.devThing) {
        await context.dispatch('syncENSEventTimestamps', parameter);
      }

      if (options.txData && !options.devThing) {
        await context.dispatch('syncENSEventTxData', parameter);
      }

      if ((options.erc721Events || options.erc1155Events || options.timestamps || options.txData) && !options.devThing) {
        await context.dispatch('collateIt', parameter);
      }

      if (options.metadata && !options.devThing) {
        await context.dispatch('syncMetadata', parameter);
      }

      // if (options.ens) {
      //   await context.dispatch('syncENS', parameter);
      // }

      // if (options.devThing) {
      //   console.log("Dev Thing");
      // }

      // context.dispatch('saveData', ['addresses', 'registry' /*, 'blocks', 'txs', 'ensMap'*/]);
      context.commit('setSyncSection', { section: null, total: null });
      context.commit('setSyncHalt', false);
      context.commit('forceRefresh');
    },

    // TODO: Add ERC-1155 NameWrapper Transfer events
    async syncENSEvents(context, parameter) {
      logInfo("dataModule", "actions.syncENSEvents: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const erc1155Interface = new ethers.utils.Interface(ERC1155ABI);

      // ERC-20 & ERC-721 Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 id)
      // [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', accountAs32Bytes, null ],
      // [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', null, accountAs32Bytes ],

      // ERC-1155 TransferSingle (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256 id, uint256 value)
      // [ '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', null, accountAs32Bytes, null ],
      // [ '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', null, null, accountAs32Bytes ],

      // ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
      // [ '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb', null, accountAs32Bytes, null ],
      // [ '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb', null, null, accountAs32Bytes ],

      // WETH Deposit (index_topic_1 address dst, uint256 wad)
      // 0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c
      // WETH Withdrawal (index_topic_1 address src, uint256 wad)
      // 0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65

      // // ERC-20 Approval (index_topic_1 address owner, index_topic_2 address spender, uint256 value)
      // // 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925
      // // ERC-721 Approval (index_topic_1 address owner, index_topic_2 address approved, index_topic_3 uint256 tokenId)
      // // 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925
      // // ERC-721 ApprovalForAll (index_topic_1 address owner, index_topic_2 address operator, bool approved)
      // // 0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31
      let total = 0;
      let t = this;
      async function processLogs(fromBlock, toBlock, section, logs) {
        total = parseInt(total) + logs.length;
        context.commit('setSyncCompleted', total);
        logInfo("dataModule", "actions.syncENSEvents.processLogs - fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", section: " + section + ", logs.length: " + logs.length + ", total: " + total);
        const records = [];
        for (const log of logs) {
          if (!log.removed) {
            const contract = log.address;
            let eventRecord = null;
            if (log.topics[0] == "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef") {
              let from = null;
              let to = null;
              let tokensOrTokenId = null;
              let tokens = null;
              let tokenId = null;
              if (log.topics.length == 4) {
                from = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
                to = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
                tokensOrTokenId = ethers.BigNumber.from(log.topics[3]).toString();
              } else if (log.topics.length == 3) {
                from = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
                to = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
                tokensOrTokenId = ethers.BigNumber.from(log.data).toString();
              // TODO: Handle 2
              } else if (log.topics.length == 1) {
                from = ethers.utils.getAddress('0x' + log.data.substring(26, 66));
                to = ethers.utils.getAddress('0x' + log.data.substring(90, 130));
                tokensOrTokenId = ethers.BigNumber.from('0x' + log.data.substring(130, 193)).toString();
              }
              if (from) {
                if (log.topics.length == 4) {
                  eventRecord = { type: "Transfer", from, to, tokenId: tokensOrTokenId, eventType: "erc721" };
                } else {
                  eventRecord = { type: "Transfer", from, to, tokens: tokensOrTokenId, eventType: "erc20" };
                }
              }
            } else if (log.topics[0] == "0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c") {
              const to = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
              tokens = ethers.BigNumber.from(log.data).toString();
              eventRecord = { type: "Transfer", from: ADDRESS0, to, tokens, eventType: "erc20" };
            } else if (log.topics[0] == "0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65") {
              const from = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
              tokens = ethers.BigNumber.from(log.data).toString();
              eventRecord = { type: "Transfer", from, to: ADDRESS0, tokens, eventType: "erc20" };
            } else if (log.topics[0] == "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925") {
              if (log.topics.length == 4) {
                const owner = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
                const approved = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
                tokenId = ethers.BigNumber.from(log.topics[3]).toString();
                eventRecord = { type: "Approval", owner, approved, tokenId, eventType: "erc721" };
              } else {
                const owner = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
                const spender = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
                tokens = ethers.BigNumber.from(log.data).toString();
                eventRecord = { type: "Approval", owner, spender, tokens, eventType: "erc20" };
              }
            } else if (log.topics[0] == "0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31") {
              const owner = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
              const operator = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
              approved = ethers.BigNumber.from(log.data).toString();
              eventRecord = { type: "ApprovalForAll", owner, operator, approved, eventType: "erc721" };
            } else if (log.topics[0] == "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62") {
              // ERC-1155 TransferSingle (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256 id, uint256 value)
              const logData = erc1155Interface.parseLog(log);
              const [operator, from, to, id, value] = logData.args;
              tokenId = ethers.BigNumber.from(id).toString();
              eventRecord = { type: "TransferSingle", operator, from, to, tokenId, value: value.toString(), eventType: "erc1155" };
            } else if (log.topics[0] == "0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb") {
              // ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
              const logData = erc1155Interface.parseLog(log);
              const [operator, from, to, ids, values] = logData.args;
              const tokenIds = ids.map(e => ethers.BigNumber.from(e).toString());
              eventRecord = { type: "TransferBatch", operator, from, to, tokenIds, values: values.map(e => e.toString()), eventType: "erc1155" };
            } else {
              console.log("NOT HANDLED: " + JSON.stringify(log));
            }
            // TODO: Testing if (eventRecord && contract == "0x7439E9Bb6D8a84dd3A23fe621A30F95403F87fB9") {
            if (eventRecord && (contract == ENS_ERC721_ADDRESS || contract == ENS_ERC1155_ADDRESS)) {
              records.push( {
                chainId: parameter.chainId,
                blockNumber: parseInt(log.blockNumber),
                logIndex: parseInt(log.logIndex),
                txIndex: parseInt(log.transactionIndex),
                txHash: log.transactionHash,
                contract,
                ...eventRecord,
                confirmations: parameter.blockNumber - log.blockNumber,
                timestamp: null,
                tx: null,
              });
            }
          }
        }
        if (records.length) {
          await db.tokenEvents.bulkAdd(records).then (function(lastKey) {
            console.log("syncENSEvents.bulkAdd lastKey: " + JSON.stringify(lastKey));
          }).catch(Dexie.BulkError, function(e) {
            console.log("syncENSEvents.bulkAdd e: " + JSON.stringify(e.failures, null, 2));
          });
        }
      }
      async function getLogs(fromBlock, toBlock, section, selectedAddresses, processLogs) {
        logInfo("dataModule", "actions.syncENSEvents.getLogs - fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", section: " + section);
        try {
          let topics = null;
          let logs = null;
          if (section == 0) {
            topics = [[
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c',
                '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65',
                '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
                '0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31',
              ],
              selectedAddresses,
              null
            ];
            logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
            await processLogs(fromBlock, toBlock, section, logs);
          } else if (section == 1) {
            topics = [ ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'], null, selectedAddresses ];
            logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
            await processLogs(fromBlock, toBlock, section, logs);
          } else if (section == 2) {
            topics = [ [
              '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
              '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb',
            ], null, selectedAddresses ];
            logs = await provider.getLogs({ address: ENS_ERC1155_ADDRESS, fromBlock, toBlock, topics });
            await processLogs(fromBlock, toBlock, section, logs);
          } else if (section == 3) {
            topics = [ [
              '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
              '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb',
            ], null, null, selectedAddresses ];
            logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
            await processLogs(fromBlock, toBlock, section, logs);
          }
          // const logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
        } catch (e) {
          const mid = parseInt((fromBlock + toBlock) / 2);
          await getLogs(fromBlock, mid, section, selectedAddresses, processLogs);
          await getLogs(parseInt(mid) + 1, toBlock, section, selectedAddresses, processLogs);
        }
      }
      logInfo("dataModule", "actions.syncENSEvents BEGIN");
      context.commit('setSyncSection', { section: 'ENS Events', total: null });
      // this.sync.completed = 0;
      // this.sync.total = 0;
      // this.sync.section = 'ERC-20 & ERC-721 Tokens';
      // TODO
      // const selectedAddresses = ['0x000000000000000000000000' + parameter.coinbase.substring(2, 42).toLowerCase()];
      // console.log(selectedAddresses);
      const selectedAddresses = [];
      for (const [address, addressData] of Object.entries(context.state.addresses)) {
        if (address.substring(0, 2) == "0x" && addressData.mine) {
          selectedAddresses.push('0x000000000000000000000000' + address.substring(2, 42).toLowerCase());
        }
      }
      console.log("selectedAddresses: " + JSON.stringify(selectedAddresses, null, 2));
      if (selectedAddresses.length > 0) {
      //   const deleteCall = await db.tokenEvents.where("confirmations").below(parameter.confirmations).delete();
      //   const latest = await db.tokenEvents.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).last();
      //   const startBlock = (parameter.incrementalSync && latest) ? parseInt(latest.blockNumber) + 1: 0;
        const startBlock = 0;
        if (parameter.erc721Events) {
          for (let section = 0; section < 2; section++) {
            await getLogs(startBlock, parameter.blockNumber, section, selectedAddresses, processLogs);
          }
        }
        if (parameter.erc1155Events) {
          for (let section = 2; section < 4; section++) {
            await getLogs(startBlock, parameter.blockNumber, section, selectedAddresses, processLogs);
          }
        }
      }
      logInfo("dataModule", "actions.syncENSEvents END");
    },

    async syncENSEventTimestamps(context, parameter) {
      logInfo("dataModule", "actions.syncENSEventTimestamps: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      let rows = 0;
      let done = false;
      const existingTimestamps = context.state.timestamps[parameter.chainId] || {};
      const newBlocks = {};
      do {
        let data = await db.tokenEvents.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.syncENSEventTimestamps - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        for (const item of data) {
          if (!(item.blockNumber in existingTimestamps) && !(item.blockNumber in newBlocks)) {
            newBlocks[item.blockNumber] = true;
          }
        }
        rows += data.length;
        done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
      } while (!done);
      const total = Object.keys(newBlocks).length;
      logInfo("dataModule", "actions.syncENSEventTimestamps - total: " + total);
      context.commit('setSyncSection', { section: 'ENS Event Timestamps', total });
      let completed = 0;
      for (let blockNumber of Object.keys(newBlocks)) {
        const block = await provider.getBlock(parseInt(blockNumber));
        context.commit('addTimestamp', {
          chainId: parameter.chainId,
          blockNumber,
          timestamp: block.timestamp,
        });
        completed++;
        context.commit('setSyncCompleted', completed);
        if (context.state.sync.halt) {
          break;
        }
      }
      // console.log("context.state.timestamps: " + JSON.stringify(context.state.timestamps, null, 2));
      await context.dispatch('saveData', ['timestamps']);
      logInfo("dataModule", "actions.syncENSEventTimestamps END");
    },

    async syncENSEventTxData(context, parameter) {
      logInfo("dataModule", "actions.syncENSEventTxData: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      let rows = 0;
      let done = false;
      const existingTxs = context.state.txs[parameter.chainId] || {};
      const newTxs = {};
      do {
        let data = await db.tokenEvents.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.syncENSEventTxData - data.length: " + data.length + ", first[0..9]: " + JSON.stringify(data.slice(0, 10).map(e => e.blockNumber + '.' + e.logIndex )));
        for (const item of data) {
          if (!(item.txHash in existingTxs) && !(item.txHash in newTxs)) {
            newTxs[item.txHash] = true;
          }
        }
        rows += data.length;
        done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
      } while (!done);
      const total = Object.keys(newTxs).length;
      logInfo("dataModule", "actions.syncENSEventTxData - total: " + total);
      context.commit('setSyncSection', { section: 'ENS Event Tx Data', total });
      let completed = 0;
      for (let txHash of Object.keys(newTxs)) {
        const tx = await provider.getTransaction(txHash);
        const txReceipt = await provider.getTransactionReceipt(txHash);
        context.commit('addTx', {
          chainId: parameter.chainId,
          txHash,
          type: tx.type,
          blockHash: tx.blockHash,
          from: tx.from,
          gasPrice: ethers.BigNumber.from(tx.gasPrice).toString(),
          gasLimit: ethers.BigNumber.from(tx.gasLimit).toString(),
          to: tx.to,
          value: ethers.BigNumber.from(tx.value).toString(),
          nonce: tx.nonce,
          data: tx.to && tx.data || null, // Remove contract creation data to reduce memory footprint
          contractAddress: txReceipt.contractAddress,
          transactionIndex: txReceipt.transactionIndex,
          gasUsed: ethers.BigNumber.from(txReceipt.gasUsed).toString(),
          blockHash: txReceipt.blockHash,
          logs: txReceipt.logs,
          cumulativeGasUsed: ethers.BigNumber.from(txReceipt.cumulativeGasUsed).toString(),
          effectiveGasPrice: ethers.BigNumber.from(txReceipt.effectiveGasPrice).toString(),
          status: txReceipt.status,
          type: txReceipt.type,
        });
        completed++;
        context.commit('setSyncCompleted', completed);
        if (context.state.sync.halt) {
          break;
        }
      }
      // console.log("context.state.txs: " + JSON.stringify(context.state.txs, null, 2));
      await context.dispatch('saveData', ['txs']);
      logInfo("dataModule", "actions.syncENSEventTxData END");
    },

    async collateIt(context, parameter) {
      logInfo("dataModule", "actions.collateIt: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const selectedAddressesMap = {};
      for (const [address, addressData] of Object.entries(context.state.addresses)) {
        if (address.substring(0, 2) == "0x" && addressData.mine) {
          selectedAddressesMap[address] = true;
        }
      }
      console.log("selectedAddressesMap: " + Object.keys(selectedAddressesMap));

      let rows = 0;
      let done = false;

      do {
        let data = await db.tokenEvents.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.collateIt - sales - data.length: " + data.length + ", first[0..1]: " + JSON.stringify(data.slice(0, 2).map(e => e.blockNumber + '.' + e.logIndex )));
        for (const transfer of data) {
          // if (transfer.eventType == "erc721" && transfer.type == "Transfer") {
          if ((transfer.from in selectedAddressesMap) || (transfer.to in selectedAddressesMap)) {
            context.commit('processTokenTransfer', transfer);
          }
          // }
        }
        rows = parseInt(rows) + data.length;
        done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
      } while (!done);
      // console.log("context.state.tokens: " + JSON.stringify(context.state.tokens, null, 2));


      // do {
      //   let data = await db.tokenEvents.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
      //   logInfo("dataModule", "actions.collateIt - sales - data.length: " + data.length + ", first[0..1]: " + JSON.stringify(data.slice(0, 2).map(e => e.blockNumber + '.' + e.logIndex )));
      //   for (const transfer of data) {
      //     if (transfer.eventType == "erc721" && transfer.type == "Transfer") {
      //       if ((transfer.from in selectedAddressesMap) || (transfer.to in selectedAddressesMap)) {
      //         context.commit('processTokenTransfer', transfer);
      //       }
      //     }
      //     // if (item.tx.to != ENS_ETHREGISTRARCONTROLLER) {
      //     //   const log = item.tx.logs.filter(e => e.logIndex == item.logIndex);
      //     // } else if (
      //     //   item.tx.to != OPENSEA_TRANSFERHELPER &&
      //     //   item.tx.to != ENS_OLD_ETHREGISTRARCONTROLLER &&
      //     //   // item.tx.to != ENS_ETHREGISTRARCONTROLLER &&
      //     //   item.tx.to != ENS_BASEREGISTRARIMPLEMENTATION &&
      //     //   item.tx.to != ENSVISION_BULKREGISTRATION_1 &&
      //     //   item.tx.to != ENSVISION_BULKREGISTRATION_2 &&
      //     //   item.tx.to != SEAPORT_1_1 &&
      //     //   item.tx.to != SEAPORT_1_4 &&
      //     //   item.tx.to != SEAPORT_1_5 &&
      //     //   item.tx.to != ENS_ERC1155_ADDRESS &&
      //     //   item.tx.to != RESERVOIRV6_0_1
      //     // ) {
      //     //   console.log(item.txHash + " " + item.tx.to + " " + item.to);
      //     // }
      //   }
      //   rows = parseInt(rows) + data.length;
      //   done = data.length < context.state.DB_PROCESSING_BATCH_SIZE; // || rows >= 3000;
      //   // done = true;
      // } while (!done);
      // // context.commit('setSales', sales);
      // // console.log("tokens: " + JSON.stringify(tokens, null, 2));
      // console.log("context.state.tokens: " + JSON.stringify(context.state.tokens, null, 2));



      // let collection = null;
      // // const tokens = {};
      // const owners = {};
      // const collator = {};
      // do {
      //   let data = await db.tokens.where('[chainId+contract+tokenId]').between([parameter.chainId, context.state.selectedCollection, Dexie.minKey],[parameter.chainId, context.state.selectedCollection, Dexie.maxKey]).offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
      //   logInfo("dataModule", "actions.collateIt - tokens - data.length: " + data.length + ", first[0..1]: " + JSON.stringify(data.slice(0, 2).map(e => e.contract + '/' + e.tokenId )));
      //   for (const token of data) {
      //     for (const attribute of token.attributes) {
      //       if (!collator[attribute.trait_type]) {
      //         collator[attribute.trait_type] = {};
      //       }
      //       if (!collator[attribute.trait_type][attribute.value]) {
      //         collator[attribute.trait_type][attribute.value] = [token.tokenId];
      //       } else {
      //         collator[attribute.trait_type][attribute.value].push(token.tokenId);
      //       }
      //     }
      //     if (collection == null) {
      //       collection = {
      //         contract: token.contract,
      //         id: token.collection.id,
      //         name: token.collection.name,
      //         image: token.collection.image,
      //         slug: token.collection.slug,
      //         creator: token.collection.creator,
      //         tokenCount: token.collection.tokenCount,
      //       };
      //     }
      //     context.commit('addOrUpdateToken', {
      //       chainId: token.chainId,
      //       contract: token.contract,
      //       tokenId: token.tokenId,
      //       name: token.name,
      //       description: token.description,
      //       image: token.image,
      //       kind: token.kind,
      //       isFlagged: token.isFlagged,
      //       isSpam: token.isSpam,
      //       isNsfw: token.isNsfw,
      //       metadataDisabled: token.metadataDisabled,
      //       rarity: token.rarity,
      //       rarityRank: token.rarityRank,
      //       attributes: token.attributes,
      //       owner: token.owner,
      //       tags: [],
      //     });
      //     if (!(token.owner in owners)) {
      //       owners[token.owner] = [];
      //     }
      //     owners[token.owner].push(token.tokenId);
      //   }
      //   rows = parseInt(rows) + data.length;
      //   done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
      // } while (!done);
      // context.commit('setCollection', collection);
      // // context.commit('setTokens', tokens);
      //
      // const attributes = [];
      // for (const [attributeType, attributeData] of Object.entries(collator)) {
      //   const attributeList = [];
      //   for (const [attribute, tokenIds] of Object.entries(attributeData)) {
      //     attributeList.push({ attribute, tokenIds });
      //   }
      //   attributeList.sort((a, b) => a.tokenIds.length - b.tokenIds.length);
      //   attributes.push({ attributeType, attributeList });
      // }
      // attributes.sort((a, b) => ('' + a.attributeType).localeCompare(b.attributeType))
      // context.commit('setAttributes', attributes);
      //
      // // TODO: Only sort numerically if all tokenIds <= 5 characters
      // const ownerList = Object.keys(owners);
      // for (const owner of ownerList) {
      //   const tokenIds = owners[owner];
      //   tokenIds.sort((a, b) => {
      //     return parseInt(a) - parseInt(b);
      //   });
      //   owners[owner] = tokenIds;
      // }
      // context.commit('setOwners', owners);
      //
      // rows = 0;
      // done = false;
      // const sales = [];
      // do {
      //   let data = await db.sales.where('[chainId+blockNumber+logIndex]').between([parameter.chainId, Dexie.minKey, Dexie.minKey],[parameter.chainId, Dexie.maxKey, Dexie.maxKey]).offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
      //   logInfo("dataModule", "actions.collateIt - sales - data.length: " + data.length + ", first[0..1]: " + JSON.stringify(data.slice(0, 2).map(e => e.blockNumber + '.' + e.logIndex )));
      //   for (const item of data) {
      //     sales.push(item);
      //   }
      //   rows = parseInt(rows) + data.length;
      //   done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
      // } while (!done);
      // context.commit('setSales', sales);
      //
      // rows = 0;
      // done = false;
      // const listings = [];
      // do {
      //   let data = await db.listings.where('[chainId+contract+id]').between([parameter.chainId, context.state.selectedCollection, Dexie.minKey],[parameter.chainId, context.state.selectedCollection, Dexie.maxKey]).offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
      //   logInfo("dataModule", "actions.collateIt - listings - data.length: " + data.length + ", first[0..1]: " + JSON.stringify(data.slice(0, 2).map(e => e.contract + '.' + e.id )));
      //   for (const item of data) {
      //     listings.push(item);
      //   }
      //   rows = parseInt(rows) + data.length;
      //   done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
      // } while (!done);
      // context.commit('setListings', listings);
      //
      // rows = 0;
      // done = false;
      // const offers = [];
      // do {
      //   let data = await db.offers.where('[chainId+contract+id]').between([parameter.chainId, context.state.selectedCollection, Dexie.minKey],[parameter.chainId, context.state.selectedCollection, Dexie.maxKey]).offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
      //   logInfo("dataModule", "actions.collateIt - offers - data.length: " + data.length + ", first[0..1]: " + JSON.stringify(data.slice(0, 2).map(e => e.contract + '.' + e.id )));
      //   for (const item of data) {
      //     offers.push(item);
      //   }
      //   rows = parseInt(rows) + data.length;
      //   done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
      // } while (!done);
      // context.commit('setOffers', offers);
      //
      // await context.dispatch('saveData', ['collection', 'tokens', 'attributes', 'owners', 'sales', 'listings', 'offers']);
      await context.dispatch('saveData', ['tokens']);
      logInfo("dataModule", "actions.collateIt END");
    },

    async syncMetadata(context, parameter) {
      logInfo("dataModule", "actions.syncMetadata: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      let total = 0;
      let completed = 0;
      for (const [contract, contractData] of Object.entries(context.state.tokens[parameter.chainId] || {})) {
        for (const [tokenId, tokenData] of Object.entries(contractData)) {
          if (tokenData.name) {
            completed++;
            console.log(completed + " Completed " + tokenData.name);
          }
          total++;
        }
      }
      context.commit('setSyncSection', { section: 'Token Metadata', total });
      context.commit('setSyncCompleted', completed);

      total = 0;
      for (const [contract, contractData] of Object.entries(context.state.tokens[parameter.chainId] || {})) {
        for (const [tokenId, tokenData] of Object.entries(contractData)) {
          if (!tokenData.name /*&& tokenId == "53835211818918528779359817553631021141919078878710948845228773628660104698081"*/) {
            // console.log(contract + "/" + tokenId + " = > " + JSON.stringify(tokenData));
            const tokenURI = "https://metadata.ens.domains/mainnet/" + contract + "/" + tokenId;
            console.log(tokenURI);
            try {
              const metadataFileContent = await fetch(tokenURI).then(response => response.json());
              // console.log(JSON.stringify(metadataFileContent, null, 2));
              let expiredName = null;
              let created = null;
              let registration = null;
              let expiry = null;
              let expired = false;
              if (metadataFileContent && metadataFileContent.message) {
                let inputString;
                [inputString, expiredName, expiryString] = metadataFileContent.message.match(/'(.*)'.*at\s(.*)\./) || [null, null, null]
                expiry = moment.utc(expiryString).unix();
                // console.log("EXPIRED - name: '" + name + "', expiryString: '" + expiryString + "', expiry: " + expiry);
                expired = true;
              } else {

                const createdRecord = metadataFileContent.attributes.filter(e => e.trait_type == "Created Date");
                // console.log("createdRecord: " + JSON.stringify(createdRecord, null, 2));
                created = createdRecord.length == 1 && createdRecord[0].value / 1000 || null;

                if (contract == ENS_ERC721_ADDRESS) {
                  const registrationRecord = metadataFileContent.attributes.filter(e => e.trait_type == "Registration Date");
                  // console.log("registrationRecord: " + JSON.stringify(registrationRecord, null, 2));
                  registration = registrationRecord.length == 1 && registrationRecord[0].value / 1000 || null;

                  const expiryRecord = metadataFileContent.attributes.filter(e => e.trait_type == "Expiration Date");
                  // console.log("expiryRecord: " + JSON.stringify(expiryRecord, null, 2));
                  expiry = expiryRecord.length == 1 && expiryRecord[0].value / 1000 || null;
                } else if (contract == ENS_ERC1155_ADDRESS) {
                  const expiryRecord = metadataFileContent.attributes.filter(e => e.trait_type == "Namewrapper Expiry Date");
                  // console.log("expiryRecord: " + JSON.stringify(expiryRecord, null, 2));
                  expiry = expiryRecord.length == 1 && expiryRecord[0].value / 1000 || null;
                }

              }
              const name = expired ? expiredName : (metadataFileContent.name || undefined);
              const description = expired ? ("Expired " + expiredName) : (metadataFileContent.description || undefined);
              // console.log("description: " + description);
              // console.log("expiry: " + expiry);
              const attributes = expired ? [] : (metadataFileContent.attributes || []);
              attributes.sort((a, b) => {
                return ('' + a.trait_type).localeCompare(b.trait_type);
              });
              // console.log("attributes: " + JSON.stringify(attributes, null, 2));
              const image = expired ? null : metadataFileContent.image;
              // const imageSource = expired ? null : metadataFileContent.image;
              // let image = null;
              // if (!expired) {
              //   const imageFile = metadataFileContent.image.substring(0, 7) == "ipfs://" ? "https://ipfs.io/ipfs/" + metadataFileContent.image.substring(7) : metadataFileContent.image;
              //   const base64 = await imageUrlToBase64(imageFile);
              //   image = base64 || undefined;
              // }
              // console.log("image: " + JSON.stringify(image, null, 2));
              console.log("name: " + name + ", created: " + created + ", registration: " + registration + ", expiry: " + expiry);
              context.commit('updateTokenMetadata', {
                chainId: parameter.chainId,
                contract,
                tokenId,
                name,
                description,
                created,
                registration,
                expiry,
                attributes,
                image,
              });

            } catch (e) {
              console.error(e.message);
            }
            completed++;
            context.commit('setSyncCompleted', completed);
          }
          if (context.state.sync.halt) {
            break;
          }
        }
        if (context.state.sync.halt) {
          break;
        }
      }
      await context.dispatch('saveData', ['tokens']);
    },

    async syncImportExchangeRates(context, parameter) {
      const reportingCurrency = store.getters['config/settings'].reportingCurrency;
      logInfo("dataModule", "actions.syncImportExchangeRates - reportingCurrency: " + reportingCurrency);
      const MAXDAYS = 2000;
      const MINDATE = moment("2015-07-30");
      let toTs = moment();
      const results = {};
      while (toTs.year() >= 2015) {
        let days = toTs.diff(MINDATE, 'days');
        if (days > MAXDAYS) {
          days = MAXDAYS;
        }
        let url = "https://min-api.cryptocompare.com/data/v2/histoday?fsym=ETH&tsym=" + reportingCurrency + "&toTs=" + toTs.unix() + "&limit=" + days;
        if (parameter.cryptoCompareAPIKey) {
          url = url + "&api_key=" + parameter.cryptoCompareAPIKey;
        }
        console.log(url);
        const data = await fetch(url)
          .then(response => response.json())
          .catch(function(e) {
            console.log("error: " + e);
          });
        for (day of data.Data.Data) {
          results[moment.unix(day.time).format("YYYYMMDD")] = day.close;
        }
        toTs = moment(toTs).subtract(MAXDAYS, 'days');
      }
      context.commit('setExchangeRates', results);
      context.dispatch('saveData', ['exchangeRates']);
    },

    async syncENS(context, parameter) {
      logInfo("dataModule", "actions.syncENS BEGIN: " + JSON.stringify(parameter));
      const db = new Dexie(context.state.db.name);
      db.version(context.state.db.version).stores(context.state.db.schemaDefinition);
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      let rows = 0;
      let done = false;

      let collection = null;
      const tokens = {};
      const owners = {};
      do {
        let data = await db.tokens.where('[chainId+contract+tokenId]').between([parameter.chainId, context.state.selectedCollection, Dexie.minKey],[parameter.chainId, context.state.selectedCollection, Dexie.maxKey]).offset(rows).limit(context.state.DB_PROCESSING_BATCH_SIZE).toArray();
        logInfo("dataModule", "actions.syncENS - tokens - data.length: " + data.length + ", first[0..1]: " + JSON.stringify(data.slice(0, 2).map(e => e.contract + '/' + e.tokenId )));
        for (const item of data) {
          if (!(item.owner in owners)) {
            owners[item.owner] = [];
          }
          owners[item.owner].push(item.tokenId);
        }
        rows = parseInt(rows) + data.length;
        done = data.length < context.state.DB_PROCESSING_BATCH_SIZE;
      } while (!done);
      // console.log("owners: " + JSON.stringify(owners, null, 2));

      context.commit('setSyncSection', { section: "ENS", total: Object.keys(owners).length });
      let completed = 0;

      const ensReverseRecordsContract = new ethers.Contract(ENSREVERSERECORDSADDRESS, ENSREVERSERECORDSABI, provider);
      const addresses = Object.keys(owners);
      const ENSOWNERBATCHSIZE = 25; // Can do 200, but incorrectly misconfigured reverse ENS causes the whole call to fail
      for (let i = 0; i < addresses.length; i += ENSOWNERBATCHSIZE) {
        const batch = addresses.slice(i, parseInt(i) + ENSOWNERBATCHSIZE);
        try {
          const allnames = await ensReverseRecordsContract.getNames(batch);
          for (let j = 0; j < batch.length; j++) {
            const address = batch[j];
            const name = allnames[j];
            // const normalized = normalize(address);
            if (name) {
              console.log(address + " => " + name);
              context.commit('setENS', { address, name });
            }
          }
        } catch (e) {
          for (let j = 0; j < batch.length; j++) {
            try {
              const address = batch[j];
              const allnames = await ensReverseRecordsContract.getNames([address]);
              const name = allnames[0];
              if (name) {
                console.log(address + " => " + name);
                context.commit('setENS', { address, name });
              }
            } catch (e1) {
              console.log("Error - address: " + batch[j] + ", message: " + e1.message);
            }
          }
        }
        completed += batch.length;
        context.commit('setSyncCompleted', completed);
      }
      console.log("context.state.ens: " + JSON.stringify(context.state.ens, null, 2));
      context.dispatch('saveData', ['ens']);
    },
    // Called by Connection.execWeb3()
    async execWeb3({ state, commit, rootState }, { count, listenersInstalled }) {
      logInfo("dataModule", "execWeb3() start[" + count + ", " + listenersInstalled + ", " + JSON.stringify(rootState.route.params) + "]");
    },
  },
};
