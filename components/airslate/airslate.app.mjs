import { axios } from "@pipedream/platform";

export default {
  type: "app",
  app: "airslate",
  propDefinitions: {
    slateId: {
      type: "string",
      label: "Slate ID",
      description: "The unique identifier for a Slate",
      async options({ page = 0 }) {
        const slates = await this.listSlates({
          page,
        });
        return slates.map((slate) => ({
          label: slate.name,
          value: slate.id,
        }));
      },
    },
  },
  methods: {
    _baseUrl() {
      return "https://api.airslate.com";
    },
    async _makeRequest(opts = {}) {
      const {
        $ = this,
        method = "GET",
        path,
        headers,
        ...otherOpts
      } = opts;
      return axios($, {
        ...otherOpts,
        method,
        url: this._baseUrl() + path,
        headers: {
          ...headers,
          Authorization: `Bearer ${this.$auth.oauth_access_token}`,
        },
      });
    },
    async listSlates(opts = {}) {
      const { page } = opts;
      return this._makeRequest({
        path: `/v1/slates?page=${page}`,
      });
    },
    async getSlate({ slateId }) {
      return this._makeRequest({
        path: `/v1/slates/${slateId}`,
      });
    },
    async paginate(fn, ...opts) {
      const results = [];
      let page = 0;
      let hasMore = true;

      while (hasMore) {
        const response = await fn.call(this, {
          page,
          ...opts,
        });
        results.push(...response);
        page += 1;
        hasMore = response.length > 0;
      }

      return results;
    },
    authKeys() {
      console.log(Object.keys(this.$auth));
    },
  },
};
