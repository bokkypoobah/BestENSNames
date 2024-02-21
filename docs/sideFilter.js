const SideFilter = {
  template: `
    <div>
      <b-card no-header no-body class="m-0 p-0 border-0">
        <b-card-body v-if="chainId && selectedCollection && attributes[chainId] && attributes[chainId][selectedCollection]" class="m-0 mt-0 pl-0 pr-2 py-1" style="flex-grow: 1; max-height: 3000px; overflow-y: auto;">
          <div v-for="attribute of attributes[chainId][selectedCollection]">
            <b-card header-class="m-0 px-2 pt-2 pb-0" body-class="p-0" class="m-0 p-0 border-0">
              <template #header>
                <span variant="secondary" class="small truncate">
                  {{ attribute.attributeType }}
                </span>
              </template>
              <div v-for="(value, i) of attribute.attributeList" v-bind:key="i">
                <div class="d-flex flex-wrap m-0 p-0">
                  <div class="ml-1 mt-1 pr-1">
                    <b-form-checkbox size="sm" :checked="(attributeFilter[chainId] && attributeFilter[chainId][selectedCollection] && attributeFilter[chainId][selectedCollection][attribute.attributeType] && attributeFilter[chainId][selectedCollection][attribute.attributeType][value.attribute])" @change="filterChanged({ type: attribute.attributeType, value: value.attribute })"><font size="-2">{{ value.attribute }}</font></b-form-checkbox>
                  </div>
                  <div class="mt-0 flex-grow-1">
                  </div>
                  <div class="mr-1 mt-0 pl-1">
                    <font size="-2">{{ value.tokenIds.length }}</font>
                  </div>
                </div>
              </div>
            </b-card>
          </div>
        </b-card-body>
      </b-card>
    </div>
  `,
  data: function () {
    return {
    }
  },
  computed: {
    chainId() {
      return store.getters['connection/chainId'];
    },
    selectedCollection() {
      return store.getters['data/selectedCollection'];
    },
    attributes() {
      return store.getters['data/attributes'];
    },
    attributeFilter() {
      return store.getters['data/attributeFilter'];
    },
  },
  methods: {
    filterChanged(info) {
      store.dispatch('data/attributeFilterChanged', info);
    },
  },
};

const sideFilterModule = {
  namespaced: true,
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
};
