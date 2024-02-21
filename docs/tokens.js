const Tokens = {
  template: `
    <div class="m-0 p-0">
      <b-card no-body no-header class="border-0">

        <!-- :MODALFAUCETS -->
        <b-modal ref="modalfaucet" id="modal-faucets" hide-footer body-bg-variant="light" size="md">
          <template #modal-title>ERC-721 Faucets</template>
          <b-form-select size="sm" v-model="modalFaucet.selectedFaucet" :options="faucetsOptions" v-b-popover.hover.bottom="'Select faucet'"></b-form-select>
          <b-button size="sm" block :disabled="!modalFaucet.selectedFaucet" @click="drip()" variant="warning" class="mt-2">Drip {{ modalFaucet.selectedFaucet && faucets.filter(e => e.address == modalFaucet.selectedFaucet)[0] ? (faucets.filter(e => e.address == modalFaucet.selectedFaucet)[0].drip + ' Tokens') : '' }}</b-button>
        </b-modal>

        <div class="d-flex flex-wrap m-0 p-0">
          <div class="mt-0 pr-1">
            <b-button size="sm" :pressed.sync="showSideFilter" variant="link" v-b-popover.hover.top="'Toggle filter'" class="m-0 p-1"><b-icon :icon="showSideFilter ? 'layout-sidebar-inset' : 'layout-sidebar'" shift-v="+1" font-scale="1.00"></b-icon></b-button>
          </div>
          <div class="mt-0 pr-1" style="width: 200px;">
            <b-form-select size="sm" v-model="selectedCollection" @change="saveSettings" :options="collectionsOptions" v-b-popover.hover.top="'Select a collection, then click the Sync button'"></b-form-select>
          </div>
          <div class="mt-0 pr-1" style="width: 200px;">
            <b-form-input type="text" size="sm" v-model.trim="idFilter" debounce="600" v-b-popover.hover.top="'List of tokenIds or tokenId ranges'" placeholder="🔍  id1 id2-id3 ..."></b-form-input>
          </div>
          <div class="mt-0 pr-1" style="width: 200px;">
            <b-form-input type="text" size="sm" v-model.trim="ownerFilter" debounce="600" v-b-popover.hover.top="'Regex filter by owner address or name'" placeholder="🔍 owner addr/name regex"></b-form-input>
          </div>
          <div v-if="false" class="mt-0 pr-1" style="width: 200px;">
            <b-form-input type="text" size="sm" v-model.trim="settings.filter" @change="saveSettings" debounce="600" v-b-popover.hover.top="'Regex filter by address, symbol or name'" placeholder="🔍 addr/symb/name regex"></b-form-input>
          </div>
          <div v-if="false" class="mt-0 pr-1">
            <b-dropdown size="sm" variant="link" v-b-popover.hover="'Junk filter'">
              <template #button-content>
                <span v-if="settings.junkFilter == 'excludejunk'">
                  <b-iconstack font-scale="1">
                    <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                    <b-icon stacked icon="slash-circle" variant="danger"></b-icon>
                  </b-iconstack>
                </span>
                <span v-else-if="settings.junkFilter == null">
                  <b-iconstack font-scale="1">
                    <b-icon stacked icon="circle-fill" variant="warning"></b-icon>
                    <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                  </b-iconstack>
                </span>
                <span v-else>
                  <b-iconstack font-scale="1">
                    <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                  </b-iconstack>
                </span>
              </template>
              <b-dropdown-item href="#" @click="settings.junkFilter = 'excludejunk'; saveSettings()">
                <b-iconstack font-scale="1">
                  <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                  <b-icon stacked icon="slash-circle" variant="danger"></b-icon>
                </b-iconstack>
                Exclude Junk
              </b-dropdown-item>
              <b-dropdown-item href="#" @click="settings.junkFilter = null; saveSettings()">
                <b-iconstack font-scale="1">
                  <b-icon stacked icon="circle-fill" variant="warning"></b-icon>
                  <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                </b-iconstack>
                Include Junk
              </b-dropdown-item>
              <b-dropdown-item href="#" @click="settings.junkFilter = 'junk'; saveSettings()">
                <b-iconstack font-scale="1">
                  <b-icon stacked icon="trash" variant="info" scale="0.75"></b-icon>
                </b-iconstack>
                Junk
              </b-dropdown-item>
            </b-dropdown>
          </div>
          <div v-if="false" class="mt-0 pr-1">
            <b-button size="sm" :pressed.sync="settings.favouritesOnly" @click="saveSettings" variant="transparent" v-b-popover.hover.bottom="'Show favourited only'"><b-icon :icon="settings.favouritesOnly ? 'heart-fill' : 'heart'" font-scale="0.95" variant="danger"></b-icon></b-button>
          </div>
          <div v-if="false" class="mt-0 flex-grow-1">
          </div>
          <div v-if="false" class="mt-0 pr-1">
            <b-button size="sm" @click="viewFaucets" variant="link" v-b-popover.hover.bottom="'Drip tokens from ERC-20 and ERC-721 faucets'"><b-icon-plus shift-v="+1" font-scale="1.0"></b-icon-plus></b-button>
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div v-if="sync.section == null" class="mt-0 pr-1">
            <b-button size="sm" :disabled="!coinbase || !selectedCollection" @click="viewSyncOptions" variant="link" v-b-popover.hover.top="'Sync data from the blockchain'"><b-icon-cloud-download shift-v="+1" font-scale="1.2"></b-icon-cloud-download></b-button>
          </div>
          <div v-if="sync.section != null" class="mt-1" style="width: 300px;">
            <b-progress height="1.5rem" :max="sync.total" show-progress :animated="sync.section != null" :variant="sync.section != null ? 'success' : 'secondary'" v-b-popover.hover.top="'Click the button on the right to stop. This process can be continued later'">
              <b-progress-bar :value="sync.completed">
                {{ sync.total == null ? (sync.completed + ' ' + sync.section) : (sync.completed + '/' + sync.total + ' ' + ((sync.completed / sync.total) * 100).toFixed(0) + '% ' + sync.section) }}
              </b-progress-bar>
            </b-progress>
          </div>
          <div class="ml-0 mt-1">
            <b-button v-if="sync.section != null" size="sm" @click="halt" variant="link" v-b-popover.hover.top="'Click to stop. This process can be continued later'"><b-icon-stop-fill shift-v="+1" font-scale="1.0"></b-icon-stop-fill></b-button>
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div v-if="false" class="mt-0 pr-1">
            <b-button size="sm" :disabled="!coinbase" @click="newTransfer(null); " variant="link" v-b-popover.hover.top="'New Stealth Transfer'"><b-icon-caret-right shift-v="+1" font-scale="1.1"></b-icon-caret-right></b-button>
          </div>
          <div v-if="false" class="mt-0 flex-grow-1">
          </div>
          <div class="mt-0 pr-1">
            <b-form-select size="sm" v-model="settings.sortOption" @change="saveSettings" :options="sortOptions" v-b-popover.hover.top="'Yeah. Sort'"></b-form-select>
          </div>
          <div class="mt-0 pr-1">
            <font size="-2" v-b-popover.hover.top="'# tokens'">{{ filteredSortedItems.length + '/' + totalCollections }}</font>
          </div>
          <div class="mt-0 pr-1">
            <b-pagination size="sm" v-model="settings.currentPage" @input="saveSettings" :total-rows="filteredSortedItems.length" :per-page="settings.pageSize" style="height: 0;"></b-pagination>
          </div>
          <div class="mt-0 pl-1">
            <b-form-select size="sm" v-model="settings.pageSize" @change="saveSettings" :options="pageSizes" v-b-popover.hover.top="'Page size'"></b-form-select>
          </div>
        </div>

        <b-row class="m-0 p-0">
          <b-col v-if="showSideFilter" cols="2" class="m-0 p-0 border-0">
            <side-filter />
          </b-col>

          <b-col class="m-0 p-0">

            <b-table ref="tokenContractsTable" small fixed striped responsive hover selectable select-mode="single" @row-selected='rowSelected' :fields="fields" :items="pagedFilteredSortedItems" show-empty head-variant="light" class="m-0 mt-1">
              <template #empty="scope">
                <h6>{{ scope.emptyText }}</h6>
                <div>
                  <ul>
                    <li>
                      Connect to Ethereum Mainnet, click <b-button size="sm" variant="link" class="m-0 p-0"><b-icon-power shift-v="+1" font-scale="1.2"></b-icon-power></b-button> on the top right, then refresh this page.
                    </li>
                    <li>
                      Switch to the Tokens tab, select an NFT collection on the top left, then click <b-button size="sm" variant="link" class="m-0 p-0"><b-icon-cloud-download shift-v="+1" font-scale="1.2"></b-icon-cloud-download></b-button> above to sync this app to the blockchain
                    </li>
                  </ul>
                </div>
              </template>
              <template #cell(number)="data">
                {{ parseInt(data.index) + ((settings.currentPage - 1) * settings.pageSize) + 1 }}
              </template>

              <template #cell(image)="data">
                <b-img v-if="data.item.image" button rounded fluid :src="data.item.image">
                </b-img>
              </template>

              <template #cell(name)="data">
                <b-link :href="'https://opensea.io/assets/ethereum/' + data.item.contract + '/' + data.item.tokenId" target="_blank">
                  <b>{{ data.item.name }}</b>
                </b-link>
                <br />
                <font size="-2">
                  {{ data.item.description }}
                </font>
                <font size="-2">
                  <!-- <b-form-tags size="sm" @input="saveTokenTag({ chainId, contract: selectedCollection, tokenId: data.item.tokenId, tags: $event })" v-model="data.item.tags" tag-variant="primary" tag-pills separator=" " v-b-popover.hover="'ENTER NEW TAGS'" placeholder="" class="ml-0 mt-1 mw-100"></b-form-tags> -->
                </font>
                <b-button size="sm" @click="requestReservoirAPITokenMetadataRefresh(data.item)" variant="link" v-b-popover.hover.top="'Request Reservoir API Metadata Refresh'"><b-icon-arrow-clockwise shift-v="+1" font-scale="1.2"></b-icon-arrow-clockwise></b-button>
              </template>

              <template #cell(owner)="data">
                <b-link :href="'https://etherscan.io/address/' + data.item.owner" target="_blank">
                  <font size="-1">{{ nameOrAddress(data.item.owner) }}</font>
                </b-link>
                <b-form-tags size="sm" @input="saveTokenTag({ chainId, contract: selectedCollection, tokenId: data.item.tokenId, tags: $event })" v-model="data.item.tags" tag-variant="primary" tag-pills separator=" " v-b-popover.hover="'Enter tags'" placeholder="" class="mt-2"></b-form-tags>
              </template>

              <template #cell(attributes)="data">
                <!-- {{ data.item.attributes }} -->
                <b-row v-for="(attribute, i) in data.item.attributes"  v-bind:key="i" class="m-0 p-0">
                  <b-col cols="6" class="m-0 px-1 text-right"><font size="-2">{{ attribute.trait_type }}</font></b-col>
                  <b-col cols="6" class="m-0 px-1"><b><font size="-2">{{ ["Created Date", "Registration Date", "Expiration Date"].includes(attribute.trait_type) ? formatTimestamp(attribute.value) : attribute.value }}</font></b></b-col>
                </b-row>
              </template>

            </b-table>

          </b-col>
        </b-row>

      </b-card>
    </div>
  `,
  data: function () {
    return {
      count: 0,
      reschedule: true,
      settings: {
        filter: null,
        junkFilter: null,
        favouritesOnly: false,
        currentPage: 1,
        pageSize: 100,
        sortOption: 'tokenidasc',
        version: 0,
      },
      transfer: {
        item: null,
        stealthPrivateKey: null,
      },
      modalFaucet: {
        selectedFaucet: null,
      },
      sortOptions: [
        { value: 'tokenidasc', text: '▲ TokenId' },
        { value: 'tokeniddsc', text: '▼ TokenId' },
      ],
      fields: [
        { key: 'number', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate text-muted small' },
        // { key: 'tokenId', label: 'TokenId', sortable: false, thStyle: 'width: 16%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'image', label: 'Image', sortable: false, thStyle: 'width: 10%;', thClass: 'text-left', tdClass: 'text-truncate' },
        { key: 'name', label: 'Name/Description', sortable: false, thStyle: 'width: 25%;', thClass: 'text-left', tdClass: 'text-left' },
        { key: 'owner', label: 'Owner/Tags', sortable: false, thStyle: 'width: 30%;', thClass: 'text-left', tdClass: 'text-left' },
        { key: 'attributes', label: 'Attributes', sortable: false, thStyle: 'width: 30%;', thClass: 'text-left', tdClass: 'text-left' },
      ],
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
    chainInfo() {
      return store.getters['config/chainInfo'];
    },
    sync() {
      return store.getters['data/sync'];
    },
    pageSizes() {
      return store.getters['config/pageSizes'];
    },
    collections() {
      return store.getters['data/collections'];
    },
    selectedCollection() {
      return store.getters['data/selectedCollection'];
    },
    ens() {
      return store.getters['data/ens'];
    },
    idFilter: {
      get: function () {
        return store.getters['data/idFilter'];
      },
      set: function (idFilter) {
        store.dispatch('data/setIdFilter', idFilter);
      },
    },
    ownerFilter: {
      get: function () {
        return store.getters['data/ownerFilter'];
      },
      set: function (ownerFilter) {
        store.dispatch('data/setOwnerFilter', ownerFilter);
      },
    },
    showSideFilter: {
      get: function () {
        return store.getters['data/showSideFilter'];
      },
      set: function (show) {
        store.dispatch('data/setShowSideFilter', show);
      },
    },
    selectedCollection: {
      get: function () {
        return store.getters['data/selectedCollection'];
      },
      set: function (sc) {
        store.dispatch('data/setSelectedCollection', sc);
        // store.dispatch('viewToken/setMine', mine);
      },
    },
    tokens() {
      return store.getters['data/tokens'];
    },

    addresses() {
      return store.getters['data/addresses'];
    },
    registry() {
      return store.getters['data/registry'];
    },
    tokenContracts() {
      return store.getters['data/tokenContracts'];
    },
    tokenMetadata() {
      return store.getters['data/tokenMetadata'];
    },

    collectionsOptions() {
      const results = [];
      results.push({ value: null, text: '(select an NFT collection)' });
      for (const [address, data] of Object.entries(this.collections[this.chainId] || {})) {
        results.push({
          value: address,
          text: data.symbol + ": " + data.name,
        });
      }
      return results;
    },


    faucets() {
      return FAUCETS && FAUCETS[this.chainId];
    },
    faucetsOptions() {
      const results = [];
      if (FAUCETS && FAUCETS[this.chainId]) {
        results.push({ value: null, text: '(select a faucet)' });
        for (const item of FAUCETS[this.chainId]) {
          if (item.type == "erc721") {
            results.push({
              value: item.address,
              text: item.drip + " x " + (item.type == "erc20" ? "ERC-20 " : "ERC-721 ") + item.symbol + ' ' + item.name + (item.type == "erc20" ? " (" + item.decimals + " dp)" : "") + ' @ ' + item.address.substring(0, this.ADDRESS_SEGMENT_LENGTH + 2) + '...' + item.address.slice(-this.ADDRESS_SEGMENT_LENGTH),
            });
          }
        }
      }
      return results;
    },

    totalCollections() {
      const tokens = this.tokens[this.chainId] && this.tokens[this.chainId][this.selectedCollection] || {};
      return (store.getters['data/forceRefresh'] % 2) == 0 ? Object.keys(tokens).length : Object.keys(tokens).length;
    },
    filteredItems() {
      const results = (store.getters['data/forceRefresh'] % 2) == 0 ? store.getters['data/filteredTokens'] : store.getters['data/filteredTokens'];
      let regex = null;
      if (this.settings.filter != null && this.settings.filter.length > 0) {
        try {
          regex = new RegExp(this.settings.filter, 'i');
        } catch (e) {
          console.log("filteredItems - regex error: " + e.message);
          regex = new RegExp(/thequickbrowndogjumpsoverthelazyfox/, 'i');
        }
      }
      return results;
    },
    filteredSortedItems() {
      const results = this.filteredItems;
      if (this.settings.sortOption == 'tokenidasc') {
        results.sort((a, b) => {
          return a.tokenId - b.tokenId;
        });
      } else if (this.settings.sortOption == 'tokeniddsc') {
        results.sort((a, b) => {
          return b.tokenId - a.tokenId;
        });
      }
      return results;
    },
    pagedFilteredSortedItems() {
      // logInfo("Tokens", "pagedFilteredSortedItems - results[0..1]: " + JSON.stringify(this.filteredSortedItems.slice(0, 2), null, 2));
      return this.filteredSortedItems.slice((this.settings.currentPage - 1) * this.settings.pageSize, this.settings.currentPage * this.settings.pageSize);
    },

  },
  methods: {
    viewFaucets() {
      console.log(moment().format("HH:mm:ss") + " viewFaucets");
      this.$bvModal.show('modal-faucets');
    },
    async drip() {
      console.log(moment().format("HH:mm:ss") + " drip BEGIN: " + JSON.stringify(this.modalFaucet, null, 2));
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const faucetInfo = FAUCETS[this.chainId] && FAUCETS[this.chainId].filter(e => e.address == this.modalFaucet.selectedFaucet)[0] || null;
      if (faucetInfo) {
        console.log("faucetInfo: " + JSON.stringify(faucetInfo, null, 2));
        if (faucetInfo.type == "erc20") {
          try {
            const tx = await signer.sendTransaction({ to: faucetInfo.address, value: "0" });
            console.log("tx: " + JSON.stringify(tx));
          } catch (e) {
            console.log("drip ERC-20 - error: " + JSON.stringify(e));
          }
        } else {
          const testToadzContract = new ethers.Contract(faucetInfo.address, TESTTOADZABI, provider);
          const testToadzContractWithSigner = testToadzContract.connect(provider.getSigner());
          try {
            const tx = await testToadzContractWithSigner.mint(3);
            console.log("tx: " + JSON.stringify(tx));
          } catch (e) {
            console.log("drip ERC-721 - error: " + JSON.stringify(e));
          }
        }
      }
    },

    saveTokenTag(info) {
      logInfo("Tokens", ".methods.saveTokenTag - info: " + JSON.stringify(info, null, 2));
      store.dispatch('data/saveTokenTag', info);
    },
    toggleTokenContractJunk(item) {
      logInfo("Tokens", ".methods.toggleTokenContractJunk - item: " + JSON.stringify(item, null, 2));
      store.dispatch('data/toggleTokenContractJunk', item);
    },
    toggleTokenContractFavourite(item) {
      logInfo("Tokens", ".methods.toggleTokenContractFavourite - item: " + JSON.stringify(item, null, 2));
      store.dispatch('data/toggleTokenContractFavourite', item);
    },

    async requestReservoirAPITokenMetadataRefresh(token) {
      logInfo("Tokens", ".methods.requestReservoirAPITokenMetadataRefresh - token: " + JSON.stringify(token, null, 2));
      const options = {
        method: 'POST',
        // mode: 'no-cors', // cors, no-cors, *cors, same-origin
        headers: {accept: '*/*', 'content-type': 'application/json', 'x-api-key': 'demo-api-key'},
        body: JSON.stringify({
          overrideCoolDown: false,
          token: token.contract + ':' + token.tokenId,
        })
      };
      console.log("options: " + JSON.stringify(options, null, 2));
      const results = await fetch('https://api.reservoir.tools/tokens/refresh/v1', options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
      console.log("results: " + JSON.stringify(results));

      this.$bvToast.toast("Please retry after 5 minutes if required", {
        title: 'Metadata Refresh Requested. Please refresh the collection metadata in a few minutes',
        autoHideDelay: 5000,
        appendToast: true,
      });
      // setTimeout(function() {
      //   store.dispatch('data/refreshTokenMetadata', token);
      // }, 5000);
      // alert("Request sent and will data will be auto-refreshed in 5 seconds. Manually refresh the locally cached token metadata if required")
    },

    nameOrAddress(address, length = 18) {
      if (address) {
        if (this.ens[address]) {
          if (length == 0) {
            return this.ens[address];
          } else {
            if (this.ens[address].length <= length) {
              return this.ens[address];
            } else {
              return this.ens[address].substring(0, length - 10) + "..." + this.ens[address].slice(-7);
            }
          }
        } else {
          if (length == 0) {
            return address;
          } else {
            return address.substring(0, ((length - 2) / 2) + 2) + "..." + address.slice(-(length - 2)/2);
          }
        }
      }
      return null;
    },

    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
    formatETH(e, precision = 0) {
      try {
        if (precision == 0) {
          return e ? ethers.utils.formatEther(e).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : null;
        } else {
          return e ? parseFloat(parseFloat(ethers.utils.formatEther(e)).toFixed(precision)) : null;
        }
      } catch (err) {
      }
      return e.toFixed(precision);
    },
    formatDecimals(e, decimals = 18) {
      return e ? ethers.utils.formatUnits(e, decimals).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : null;
    },
    saveSettings() {
      logInfo("Tokens", "methods.saveSettings - nftSpreadsTokensSettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.nftSpreadsTokensSettings = JSON.stringify(this.settings);
    },
    async viewSyncOptions(blah) {
      store.dispatch('syncOptions/viewSyncOptions', blah);
    },
    async halt() {
      store.dispatch('data/setSyncHalt', true);
    },
    newTransfer(stealthMetaAddress = null) {
      store.dispatch('newTransfer/newTransfer', stealthMetaAddress);
    },
    getTokenType(address) {
      if (address == ADDRESS_ETHEREUMS) {
        return "eth";
      } else {
        // TODO: ERC-20 & ERC-721
        return address.substring(0, 10) + '...' + address.slice(-8);
      }
    },
    formatTimestamp(ts) {
      if (ts != null) {
        if (ts > 1000000000000n) {
          ts = ts / 1000;
        }
        if (store.getters['config/settings'].reportingDateTime) {
          return moment.unix(ts).utc().format("YYYY-MM-DD HH:mm:ss");
        } else {
          return moment.unix(ts).format("YYYY-MM-DD HH:mm:ss");
        }
      }
      return null;
    },
    commify0(n) {
      if (n != null) {
        return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      }
      return null;
    },
    rowSelected(item) {
      logInfo("Tokens", "methods.rowSelected BEGIN: " + JSON.stringify(item, null, 2));
      // if (item && item.length > 0) {
      //   store.dispatch('viewToken/viewToken', { address: item[0].address, tokenId: item[0].tokenId });
      //   this.$refs.tokenContractsTable.clearSelected();
      // }
    },

    async revealTransferSpendingPrivateKey() {
      function computeStealthKey(ephemeralPublicKey, viewingPrivateKey, spendingPrivateKey) {
        const result = {};
        result.sharedSecret = nobleCurves.secp256k1.getSharedSecret(viewingPrivateKey.substring(2), ephemeralPublicKey.substring(2), false);
        result.hashedSharedSecret = ethers.utils.keccak256(result.sharedSecret.slice(1));
        const stealthPrivateKeyNumber = (BigInt(spendingPrivateKey) + BigInt(result.hashedSharedSecret)) % BigInt(SECP256K1_N);
        const stealthPrivateKeyString = stealthPrivateKeyNumber.toString(16);
        result.stealthPrivateKey = "0x" + stealthPrivateKeyString.padStart(64, '0');
        result.stealthPublicKey = "0x" +  nobleCurves.secp256k1.ProjectivePoint.fromPrivateKey(stealthPrivateKeyNumber).toHex(false);
        result.stealthAddress = ethers.utils.computeAddress(result.stealthPublicKey);
        return result;
      }

      console.log(moment().format("HH:mm:ss") + " revealTransferSpendingPrivateKey - transfer: " + JSON.stringify(this.transfer, null, 2));
      const stealthMetaAddressData = this.addresses[this.transfer.item.linkedTo.stealthMetaAddress];
      console.log(moment().format("HH:mm:ss") + " revealTransferSpendingPrivateKey - stealthMetaAddressData: " + JSON.stringify(stealthMetaAddressData, null, 2));
      const phraseInHex = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(stealthMetaAddressData.phrase));
      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [phraseInHex, this.coinbase],
      });
      const signature1 = signature.slice(2, 66);
      const signature2 = signature.slice(66, 130);
      // Hash "v" and "r" values using SHA-256
      const hashedV = ethers.utils.sha256("0x" + signature1);
      const hashedR = ethers.utils.sha256("0x" + signature2);
      const n = ethers.BigNumber.from(SECP256K1_N);
      // Calculate the private keys by taking the hash values modulo the curve order
      const privateKey1 = ethers.BigNumber.from(hashedV).mod(n);
      const privateKey2 = ethers.BigNumber.from(hashedR).mod(n);
      const keyPair1 = new ethers.Wallet(privateKey1.toHexString());
      const keyPair2 = new ethers.Wallet(privateKey2.toHexString());
      const spendingPrivateKey = keyPair1.privateKey;
      const viewingPrivateKey = keyPair2.privateKey;
      const spendingPublicKey = ethers.utils.computePublicKey(keyPair1.privateKey, true);
      const viewingPublicKey = ethers.utils.computePublicKey(keyPair2.privateKey, true);
      // const stealthMetaAddress = "st:eth:" + spendingPublicKey + viewingPublicKey.substring(2);
      console.log(moment().format("HH:mm:ss") + " revealTransferSpendingPrivateKey - spendingPrivateKey: " + spendingPrivateKey);
      const computedStealthKey = computeStealthKey(this.transfer.item.ephemeralPublicKey, viewingPrivateKey, spendingPrivateKey);
      const stealthPrivateKey = computedStealthKey.stealthPrivateKey;
      // Vue.set(this.transfer, 'stealthPrivateKey', stealthPrivateKey);
      this.transfer.stealthPrivateKey = stealthPrivateKey;
      console.log("this.transfer: " + JSON.stringify(this.transfer, null, 2));
    },

    async timeoutCallback() {
      logDebug("Tokens", "timeoutCallback() count: " + this.count);

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
    logDebug("Tokens", "beforeDestroy()");
  },
  mounted() {
    logDebug("Tokens", "mounted() $route: " + JSON.stringify(this.$route.params));
    store.dispatch('data/restoreState');
    if ('nftSpreadsTokensSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.nftSpreadsTokensSettings);
      if ('version' in tempSettings && tempSettings.version == 0) {
        this.settings = tempSettings;
        this.settings.currentPage = 1;
      }
    }
    this.reschedule = true;
    logDebug("Tokens", "Calling timeoutCallback()");
    this.timeoutCallback();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const tokensModule = {
  namespaced: true,
  state: {
    params: null,
    executing: false,
    executionQueue: [],
  },
  getters: {
    params: state => state.params,
    executionQueue: state => state.executionQueue,
  },
  mutations: {
    deQueue(state) {
      logDebug("tokensModule", "deQueue(" + JSON.stringify(state.executionQueue) + ")");
      state.executionQueue.shift();
    },
    updateParams(state, params) {
      state.params = params;
      logDebug("tokensModule", "updateParams('" + params + "')")
    },
    updateExecuting(state, executing) {
      state.executing = executing;
      logDebug("tokensModule", "updateExecuting(" + executing + ")")
    },
  },
  actions: {
  },
};
