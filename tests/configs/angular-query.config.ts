import { defineConfig } from 'orval';

export default defineConfig({
  petstore: {
    output: {
      target: '../generated/angular-query/petstore/endpoints.ts',
      schemas: '../generated/angular-query/petstore/model',
      client: 'angular-query',
      mock: true,
      override: {
        query: {
          useQuery: true,
          useInfinite: true,
          useInfiniteQueryParam: 'limit',
        },
      },
    },
    input: {
      target: '../specifications/petstore.yaml',
      override: {
        transformer: '../transformers/add-version.js',
      },
    },
  },
  petstoreTagsSplit: {
    output: {
      target: '../generated/angular-query/petstore-tags-split/endpoints.ts',
      schemas: '../generated/angular-query/petstore-tags-split/model',
      mock: true,
      mode: 'tags-split',
      client: 'angular-query',
    },
    input: {
      target: '../specifications/petstore.yaml',
    },
  },
  petstoreSplit: {
    output: {
      target: '../generated/angular-query/split/endpoints.ts',
      schemas: '../generated/angular-query/split/model',
      mock: true,
      mode: 'split',
      client: 'angular-query',
    },
    input: {
      target: '../specifications/petstore.yaml',
    },
  },
  petstoreTags: {
    output: {
      target: '../generated/angular-query/tags/endpoints.ts',
      schemas: '../generated/angular-query/tags/model',
      mock: true,
      mode: 'tags',
      client: 'angular-query',
    },
    input: {
      target: '../specifications/petstore.yaml',
    },
  },
  httpClientFetch: {
    output: {
      target: '../generated/angular-query/http-client-fetch/endpoints.ts',
      schemas: '../generated/angular-query/http-client-fetch/model',
      mode: 'tags-split',
      client: 'angular-query',
    },
    input: {
      target: '../specifications/petstore.yaml',
    },
  },
  httpClientFetchWithIncludeHttpResponseReturnType: {
    output: {
      target:
        '../generated/angular-query/http-client-fetch-with-include-http-response-return-type/endpoints.ts',
      schemas:
        '../generated/angular-query/http-client-fetch-with-include-http-response-return-type/model',
      mode: 'tags-split',
      client: 'angular-query',
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
      },
    },
    input: {
      target: '../specifications/petstore.yaml',
    },
  },
  mutator: {
    output: {
      target: '../generated/angular-query/mutator/endpoints.ts',
      schemas: '../generated/angular-query/mutator/model',
      client: 'angular-query',
      httpClient: 'axios',
      mock: true,
      override: {
        mutator: {
          path: '../mutators/custom-instance.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useInfinite: true,
          useInfiniteQueryParam: 'limit',
        },
      },
    },
    input: {
      target: '../specifications/petstore.yaml',
      override: {
        transformer: '../transformers/add-version.js',
      },
    },
  },
  httpClientFetchWithCustomFetch: {
    output: {
      target:
        '../generated/angular-query/http-client-fetch-with-custom-fetch/endpoints.ts',
      schemas:
        '../generated/angular-query/http-client-fetch-with-custom-fetch/model',
      client: 'angular-query',
      mock: true,
      override: {
        mutator: {
          path: '../mutators/custom-fetch.ts',
          name: 'customFetch',
        },
      },
    },
    input: {
      target: '../specifications/petstore.yaml',
    },
  },
  allParamsOptional: {
    output: {
      target: '../generated/angular-query/all-params-optional/endpoints.ts',
      schemas: '../generated/angular-query/all-params-optional/model',
      client: 'angular-query',
      mock: true,
      allParamsOptional: true,
    },
    input: {
      target: '../specifications/petstore.yaml',
    },
  },
  urlEncodeParameters: {
    output: {
      target: '../generated/angular-query/url-encode-parameters/endpoints.ts',
      schemas: '../generated/angular-query/url-encode-parameters/model',
      client: 'angular-query',
      mock: true,
      urlEncodeParameters: true,
    },
    input: {
      target: '../specifications/petstore.yaml',
    },
  },
  httpClientFetchWithMultiQueryParams: {
    output: {
      target:
        '../generated/angular-query/http-client-fetch-with-multi-query-params/endpoints.ts',
      schemas:
        '../generated/angular-query/http-client-fetch-with-multi-query-params/model',
      client: 'angular-query',
    },
    input: {
      target: '../specifications/multi-query-params.yaml',
    },
  },
  formData: {
    output: {
      target: '../generated/angular-query/form-data/endpoints.ts',
      schemas: '../generated/angular-query/form-data/model',
      client: 'angular-query',
      httpClient: 'axios',
      mock: true,
      override: {
        mutator: {
          path: '../mutators/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
    input: {
      target: '../specifications/form-data.yaml',
    },
  },
  formUrlEncoded: {
    output: {
      target: '../generated/angular-query/form-url-encoded/endpoints.ts',
      schemas: '../generated/angular-query/form-url-encoded/model',
      client: 'angular-query',
      httpClient: 'axios',
      mock: true,
      override: {
        mutator: {
          path: '../mutators/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
    input: {
      target: '../specifications/form-url-encoded.yaml',
    },
  },
  usePrefetch: {
    output: {
      target: '../generated/angular-query/use-prefetch/endpoints.ts',
      schemas: '../generated/angular-query/use-prefetch/model',
      client: 'angular-query',
      override: {
        query: {
          usePrefetch: true,
        },
      },
    },
    input: {
      target: '../specifications/petstore.yaml',
    },
  },
  useInvalidate: {
    output: {
      target: '../generated/angular-query/use-invalidate/endpoints.ts',
      schemas: '../generated/angular-query/use-invalidate/model',
      client: 'angular-query',
      override: {
        query: {
          useInvalidate: true,
        },
      },
    },
    input: {
      target: '../specifications/petstore.yaml',
    },
  },
  // Unsupported for Angular Query due to Signal reactivity requirements
  // namedParameters: {
  //   output: {
  //     target: '../generated/angular-query/named-parameters/endpoints.ts',
  //     schemas: '../generated/angular-query/named-parameters/model',
  //     client: 'angular-query',
  //     override: {
  //       query: {
  //         useQuery: true,
  //         useInfinite: true,
  //         useInfiniteQueryParam: 'limit',
  //       },
  //       useNamedParameters: true,
  //     },
  //   },
  //   input: {
  //     target: '../specifications/petstore.yaml',
  //     override: {
  //       transformer: '../transformers/add-version.js',
  //     },
  //   },
  // },
});
