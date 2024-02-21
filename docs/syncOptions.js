const SyncOptions = {
  template: `
    <div>
      <b-modal ref="syncoptions" v-model="show" hide-footer body-bg-variant="light" size="sm">
        <template #modal-title>Sync Data</template>

        <b-form-checkbox size="sm" switch :disabled="chainId != 1" v-model="settings.collection" @input="saveSettings" v-b-popover.hover="'NFT Collection'" class="ml-2 mt-1">Collection</b-form-checkbox>
        <b-form-checkbox size="sm" switch :disabled="chainId != 1" v-model="settings.collectionSales" @input="saveSettings" v-b-popover.hover="'NFT Collection Sales'" class="ml-2 mt-1">Collection Sales</b-form-checkbox>
        <b-form-checkbox size="sm" switch :disabled="chainId != 1" v-model="settings.collectionListings" @input="saveSettings" v-b-popover.hover="'NFT Collection Listings'" class="ml-2 mt-1">Collection Listings</b-form-checkbox>
        <b-form-checkbox size="sm" switch :disabled="chainId != 1" v-model="settings.collectionOffers" @input="saveSettings" v-b-popover.hover="'NFT Collection Offers'" class="ml-2 mt-1">Collection Offers</b-form-checkbox>
        <b-form-checkbox size="sm" switch :disabled="chainId != 1" v-model="settings.ens" @input="saveSettings" v-b-popover.hover="'Ethereum Name Service'" class="ml-2 mt-1">ENS</b-form-checkbox>

        <!-- <b-form-checkbox size="sm" switch :disabled="settings.devThing || chainId != 11155111" v-model="settings.stealthTransfers" @input="saveSettings" v-b-popover.hover="'ERC-5564: Stealth Addresses announcements'" class="ml-2 mt-1">Stealth Transfers</b-form-checkbox>
        <b-form-checkbox size="sm" switch :disabled="settings.devThing || chainId != 11155111" v-model="settings.stealthMetaAddressRegistry" @input="saveSettings" v-b-popover.hover="'ERC-6538: Stealth Meta-Address Registry entries'" class="ml-2 mt-1">Stealth Meta-Address Registry</b-form-checkbox>
        <b-form-checkbox size="sm" switch :disabled="settings.devThing || (chainId != 1 && chainId != 11155111)" v-model="settings.tokens" @input="saveSettings" v-b-popover.hover="'ERC-20 Fungible Tokens and ERC-721 Non-Fungible Tokens'" class="ml-2 mt-1">Fungible and Non-Fungible Tokens</b-form-checkbox>
        <b-form-checkbox size="sm" switch :disabled="settings.devThing || (chainId != 1 && chainId != 11155111)" v-model="settings.erc721Metadata" @input="saveSettings" v-b-popover.hover="'ERC-721 Non-Fungible Token metadata'" class="ml-2 mt-1">Non-Fungible Token Metadata</b-form-checkbox>

        <b-form-checkbox v-if="false" size="sm" switch :disabled="chainId != 1" v-model="settings.ens" @input="saveSettings" class="ml-2 mt-1">Sync ENS names on Mainnet</b-form-checkbox>
        <b-form-checkbox v-if="false" size="sm" switch :disabled="true" v-model="settings.balances" @input="saveSettings" class="ml-2 mt-1">TODO: Balances</b-form-checkbox>
        <b-form-checkbox v-if="false" size="sm" switch :disabled="true" v-model="settings.exchangeRates" @input="saveSettings" class="ml-2 mt-1">TODO: Exchange Rates</b-form-checkbox>

        <b-form-checkbox size="sm" switch :disabled="settings.devThing" v-model="settings.incrementalSync" @input="saveSettings" v-b-popover.hover="'Incremental sync or resync all events'" class="ml-2 mt-1">Incremental Sync</b-form-checkbox> -->

        <b-form-checkbox size="sm" switch v-model="settings.devThing" @input="saveSettings" v-b-popover.hover="'Do Some Dev Thing'" class="ml-2 mt-1">Dev Thing</b-form-checkbox>

        <b-form-group label="" label-for="sync-go" label-size="sm" label-cols-sm="5" label-align-sm="right" class="mx-0 my-1 p-0">
          <b-button size="sm" id="sync-go" @click="syncNow()" variant="primary">Do It!</b-button>
        </b-form-group>
      </b-modal>
    </div>
  `,
  data: function () {
    return {
      settings: {
        collection: true,
        collectionSales: true,
        collectionListings: true,
        collectionOffers: true,
        ens: true,

        stealthTransfers: true,
        stealthMetaAddressRegistry: true,
        tokens: true,
        erc721Metadata: true,
        ens: true,
        balances: true,
        exchangeRates: true,
        incrementalSync: true,
        devThing: false,
        version: 0,
      },
    }
  },
  computed: {
    chainId() {
      return store.getters['connection/chainId'];
    },
    show: {
      get: function () {
        return store.getters['syncOptions/show'];
      },
      set: function (show) {
        store.dispatch('syncOptions/setShow', show);
      },
    },
    stealthMetaAddress: {
      get: function () {
        return store.getters['newTransfer/stealthMetaAddress'];
      },
      set: function (stealthMetaAddress) {
        store.dispatch('newTransfer/setStealthMetaAddress', stealthMetaAddress);
      },
    },

  },
  methods: {
    saveSettings() {
      // logInfo("SyncOptions", "methods.saveSettings - nftSpreadsSyncOptionsSettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.nftSpreadsSyncOptionsSettings = JSON.stringify(this.settings);
    },
    syncNow() {
      store.dispatch('data/syncIt', {
        collection: this.settings.collection,
        collectionSales: this.settings.collectionSales,
        collectionListings: this.settings.collectionListings,
        collectionOffers: this.settings.collectionOffers,
        ens: this.settings.ens,
        // stealthTransfers: this.settings.stealthTransfers,
        // stealthMetaAddressRegistry: this.settings.stealthMetaAddressRegistry,
        // tokens: this.settings.tokens,
        // erc721Metadata: this.settings.erc721Metadata,
        // ens: this.settings.ens,
        // balances: this.settings.balances,
        // exchangeRates: this.settings.exchangeRates,
        // incrementalSync: this.settings.incrementalSync,
        devThing: this.settings.devThing,
      });
      store.dispatch('syncOptions/setShow', false);
    },
  },
  mounted() {
    logDebug("SyncOptions", "mounted() $route: " + JSON.stringify(this.$route.params));
    if ('nftSpreadsSyncOptionsSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.nftSpreadsSyncOptionsSettings);
      if ('version' in tempSettings && tempSettings.version == 0) {
        this.settings = tempSettings;
      }
    }
  },
};

const syncOptionsModule = {
  namespaced: true,
  state: {
    show: false,
  },
  getters: {
    show: state => state.show,
  },
  mutations: {
    viewSyncOptions(state, blah) {
      logInfo("syncOptionsModule", "mutations.viewSyncOptions - blah: " + blah);
      state.show = true;
    },
    setShow(state, show) {
      state.show = show;
    },
  },
  actions: {
    async viewSyncOptions(context, blah) {
      logInfo("syncOptionsModule", "actions.viewSyncOptions - blah: " + blah);
      await context.commit('viewSyncOptions', blah);
    },
    async setShow(context, show) {
      await context.commit('setShow', show);
    },
  },
};
