import {
  type ClientHeaderBuilder,
  generateFormDataAndUrlEncodedFunction,
  generateMutatorConfig,
  generateMutatorRequestOptions,
  generateOptions,
  type GeneratorDependency,
  type GeneratorMutator,
  type GeneratorOptions,
  type GeneratorVerbOptions,
  type GetterResponse,
  isSyntheticDefaultImportsAllow,
  OutputHttpClient,
  pascal,
  toObjectString,
} from '@orval/core';
import {
  generateFetchHeader,
  generateRequestFunction as generateFetchRequestFunction,
} from '@orval/fetch';

import {
  angularUnwrapSignals,
  angularWrapTypeWithSignal,
  getHasSignal,
  makeRouteSafe,
  vueUnRefParams,
  vueWrapTypeWithMaybeRef,
} from './utils';

export const AXIOS_DEPENDENCIES: GeneratorDependency[] = [
  {
    exports: [
      {
        name: 'axios',
        default: true,
        values: true,
        syntheticDefaultImport: true,
      },
      { name: 'AxiosRequestConfig' },
      { name: 'AxiosResponse' },
      { name: 'AxiosError' },
    ],
    dependency: 'axios',
  },
];

export const generateQueryRequestFunction = (
  verbOptions: GeneratorVerbOptions,
  options: GeneratorOptions,
  isVue: boolean,
  isAngular: boolean,
) => {
  if (isAngular) {
    return generateAngularHttpRequestFunction(verbOptions, options);
  }
  return options.context.output.httpClient === OutputHttpClient.AXIOS
    ? generateAxiosRequestFunction(verbOptions, options, isVue)
    : generateFetchRequestFunction(verbOptions, options);
};

export const generateAxiosRequestFunction = (
  {
    headers,
    queryParams,
    operationName,
    response,
    mutator,
    body,
    props: _props,
    verb,
    formData,
    formUrlEncoded,
    override,
    paramsSerializer,
  }: GeneratorVerbOptions,
  { route: _route, context }: GeneratorOptions,
  isVue: boolean,
) => {
  let props = _props;
  let route = _route;

  if (isVue) {
    props = vueWrapTypeWithMaybeRef(_props);
  }

  if (context.output?.urlEncodeParameters) {
    route = makeRouteSafe(route);
  }

  const isRequestOptions = override.requestOptions !== false;
  const isFormData = !override.formData.disabled;
  const isFormUrlEncoded = override.formUrlEncoded !== false;
  const hasSignal = getHasSignal({
    overrideQuerySignal: override.query.signal,
    verb,
  });

  const isExactOptionalPropertyTypes =
    !!context.output.tsconfig?.compilerOptions?.exactOptionalPropertyTypes;

  const bodyForm = generateFormDataAndUrlEncodedFunction({
    formData,
    formUrlEncoded,
    body,
    isFormData,
    isFormUrlEncoded,
  });

  if (mutator) {
    const mutatorConfig = generateMutatorConfig({
      route,
      body,
      headers,
      queryParams,
      response,
      verb,
      isFormData,
      isFormUrlEncoded,
      hasSignal,
      isExactOptionalPropertyTypes,
      isVue,
    });

    const bodyDefinition = body.definition.replace('[]', String.raw`\[\]`);
    const propsImplementation =
      mutator?.bodyTypeName && body.definition
        ? toObjectString(props, 'implementation').replace(
            new RegExp(`(\\w*):\\s?${bodyDefinition}`),
            `$1: ${mutator.bodyTypeName}<${body.definition}>`,
          )
        : toObjectString(props, 'implementation');

    const requestOptions = isRequestOptions
      ? generateMutatorRequestOptions(
          override.requestOptions,
          mutator.hasSecondArg,
        )
      : '';

    if (mutator.isHook) {
      const ret = `${
        override.query.shouldExportMutatorHooks ? 'export ' : ''
      }const use${pascal(operationName)}Hook = () => {
        const ${operationName} = ${mutator.name}<${
          response.definition.success || 'unknown'
        }>();

        return useCallback((\n    ${propsImplementation}\n ${
          isRequestOptions && mutator.hasSecondArg
            ? `options${context.output.optionsParamRequired ? '' : '?'}: SecondParameter<ReturnType<typeof ${mutator.name}>>,`
            : ''
        }${hasSignal ? 'signal?: AbortSignal\n' : ''}) => {${bodyForm}
        return ${operationName}(
          ${mutatorConfig},
          ${requestOptions});
        }, [${operationName}])
      }
    `;

      const vueRet = `${
        override.query.shouldExportMutatorHooks ? 'export ' : ''
      }const use${pascal(operationName)}Hook = () => {
        const ${operationName} = ${mutator.name}<${
          response.definition.success || 'unknown'
        }>();

        return (\n    ${propsImplementation}\n ${
          isRequestOptions && mutator.hasSecondArg
            ? `options${context.output.optionsParamRequired ? '' : '?'}: SecondParameter<ReturnType<typeof ${mutator.name}>>,`
            : ''
        }${hasSignal ? 'signal?: AbortSignal\n' : ''}) => {${bodyForm}
        return ${operationName}(
          ${mutatorConfig},
          ${requestOptions});
        }
      }
    `;

      return isVue ? vueRet : ret;
    }

    return `${override.query.shouldExportHttpClient ? 'export ' : ''}const ${operationName} = (\n    ${propsImplementation}\n ${
      isRequestOptions && mutator.hasSecondArg
        ? `options${context.output.optionsParamRequired ? '' : '?'}: SecondParameter<typeof ${mutator.name}>,`
        : ''
    }${hasSignal ? 'signal?: AbortSignal\n' : ''}) => {
      ${isVue ? vueUnRefParams(props) : ''}
      ${bodyForm}
      return ${mutator.name}<${response.definition.success || 'unknown'}>(
      ${mutatorConfig},
      ${requestOptions});
    }
  `;
  }

  const isSyntheticDefaultImportsAllowed = isSyntheticDefaultImportsAllow(
    context.output.tsconfig,
  );

  const options = generateOptions({
    route,
    body,
    headers,
    queryParams,
    response,
    verb,
    requestOptions: override?.requestOptions,
    isFormData,
    isFormUrlEncoded,
    paramsSerializer,
    paramsSerializerOptions: override?.paramsSerializerOptions,
    isExactOptionalPropertyTypes,
    hasSignal,
    isVue: isVue,
  });

  const optionsArgs = generateRequestOptionsArguments({
    isRequestOptions,
    hasSignal,
  });

  const queryProps = toObjectString(props, 'implementation');

  const httpRequestFunctionImplementation = `${override.query.shouldExportHttpClient ? 'export ' : ''}const ${operationName} = (\n    ${queryProps} ${optionsArgs} ): Promise<AxiosResponse<${
    response.definition.success || 'unknown'
  }>> => {
    ${isVue ? vueUnRefParams(props) : ''}
    ${bodyForm}
    return axios${
      isSyntheticDefaultImportsAllowed ? '' : '.default'
    }.${verb}(${options});
  }
`;

  return httpRequestFunctionImplementation;
};

export const generateAngularHttpRequestFunction = (
  {
    headers,
    queryParams,
    operationName,
    response,
    body,
    props: _props,
    verb,
    formData,
    formUrlEncoded,
    override,
    paramsSerializer,
  }: GeneratorVerbOptions,
  { route: _route, context }: GeneratorOptions,
) => {
  // For Angular Query, HTTP functions take unwrapped values, not Signals
  // The inject* hooks handle Signal parameters and unwrap them before calling the HTTP function
  let props = _props;
  let route = _route;

  if (context.output?.urlEncodeParameters) {
    route = makeRouteSafe(route);
  }

  const isRequestOptions = override.requestOptions !== false;
  const isFormData = !override.formData.disabled;
  const isFormUrlEncoded = override.formUrlEncoded !== false;
  const hasSignal = getHasSignal({
    overrideQuerySignal: override.query.signal,
    verb,
  });

  const isExactOptionalPropertyTypes =
    !!context.output.tsconfig?.compilerOptions?.exactOptionalPropertyTypes;

  const bodyForm = generateFormDataAndUrlEncodedFunction({
    formData,
    formUrlEncoded,
    body,
    isFormData,
    isFormUrlEncoded,
  });

  const options = generateOptions({
    route,
    body,
    headers,
    queryParams,
    response,
    verb,
    requestOptions: override?.requestOptions,
    isFormData,
    isFormUrlEncoded,
    paramsSerializer,
    paramsSerializerOptions: override?.paramsSerializerOptions,
    isExactOptionalPropertyTypes,
    hasSignal,
    isVue: false,
  });

  const optionsArgs = generateRequestOptionsArguments({
    isRequestOptions,
    hasSignal,
    isAngular: true,
  });

  const queryProps = toObjectString(props, 'implementation');

  // For Angular HttpClient, don't specify generic type when responseType is 'text' or 'blob'
  // because Angular's type overloads handle these specially
  const shouldOmitGenericType = response.isBlob || response.contentTypes?.at(0) === 'text/plain';
  const genericType = shouldOmitGenericType ? '' : `<${response.definition.success || 'unknown'}>`;

  // Add HttpClient as first parameter
  const httpRequestFunctionImplementation = `${override.query.shouldExportHttpClient ? 'export ' : ''}const ${operationName} = (
    http: HttpClient,
    ${queryProps} ${optionsArgs}): Promise<${
    response.definition.success || 'unknown'
  }> => {
    ${bodyForm}
    return lastValueFrom(http.${verb}${genericType}(${options}));
  }
`;

  return httpRequestFunctionImplementation;
};

export const generateRequestOptionsArguments = ({
  isRequestOptions,
  hasSignal,
  isAngular,
}: {
  isRequestOptions: boolean;
  hasSignal: boolean;
  isAngular?: boolean;
}) => {
  if (isRequestOptions) {
    // Angular HttpClient doesn't have a single options interface, so we use a generic object type
    return isAngular ? 'options?: Record<string, any>\n' : 'options?: AxiosRequestConfig\n';
  }

  return hasSignal ? 'signal?: AbortSignal\n' : '';
};

export const getQueryArgumentsRequestType = (
  httpClient: OutputHttpClient,
  mutator?: GeneratorMutator,
  isAngular?: boolean,
) => {
  if (!mutator) {
    if (httpClient === OutputHttpClient.AXIOS) {
      return `axios?: AxiosRequestConfig`;
    }
    // Angular HttpClient doesn't have a single options interface
    return isAngular ? 'fetch?: Record<string, any>' : 'fetch?: RequestInit';
  }

  if (mutator.hasSecondArg && !mutator.isHook) {
    return `request?: SecondParameter<typeof ${mutator.name}>`;
  }

  if (mutator.hasSecondArg && mutator.isHook) {
    return `request?: SecondParameter<ReturnType<typeof ${mutator.name}>>`;
  }

  return '';
};

export const getQueryOptions = ({
  isRequestOptions,
  mutator,
  isExactOptionalPropertyTypes,
  hasSignal,
  httpClient,
}: {
  isRequestOptions: boolean;
  mutator?: GeneratorMutator;
  isExactOptionalPropertyTypes: boolean;
  hasSignal: boolean;
  httpClient: OutputHttpClient;
}) => {
  if (!mutator && isRequestOptions) {
    const options =
      httpClient === OutputHttpClient.AXIOS ? 'axiosOptions' : 'fetchOptions';

    if (!hasSignal) {
      return options;
    }

    return `{ ${
      isExactOptionalPropertyTypes ? '...(signal ? { signal } : {})' : 'signal'
    }, ...${options} }`;
  }

  if (mutator?.hasSecondArg && isRequestOptions) {
    if (!hasSignal) {
      return 'requestOptions';
    }

    return httpClient === OutputHttpClient.AXIOS
      ? 'requestOptions, signal'
      : '{ signal, ...requestOptions }';
  }

  if (hasSignal) {
    return httpClient === OutputHttpClient.AXIOS ? 'signal' : '{ signal }';
  }

  return '';
};

export const getHookOptions = ({
  isRequestOptions,
  httpClient,
  mutator,
}: {
  isRequestOptions: boolean;
  httpClient: OutputHttpClient;
  mutator?: GeneratorMutator;
}) => {
  if (!isRequestOptions) {
    return '';
  }

  let value = 'const {query: queryOptions';

  if (!mutator) {
    const options =
      httpClient === OutputHttpClient.AXIOS
        ? ', axios: axiosOptions'
        : ', fetch: fetchOptions';

    value += options;
  }

  if (mutator?.hasSecondArg) {
    value += ', request: requestOptions';
  }

  value += '} = options ?? {};';

  return value;
};

// Helper to deduplicate union type string: "A | B | B" -> "A | B"
const dedupeUnionTypes = (types: string): string => {
  if (!types) return types;
  // Split by '|', trim spaces, filter out empty, and dedupe using a Set
  const unique = [
    ...new Set(
      types
        .split('|')
        .map((t) => t.trim())
        .filter(Boolean),
    ),
  ];
  return unique.join(' | ');
};

export const getQueryErrorType = (
  operationName: string,
  response: GetterResponse,
  httpClient: OutputHttpClient,
  mutator?: GeneratorMutator,
) => {
  const errorsType = dedupeUnionTypes(response.definition.errors || 'unknown');

  if (mutator) {
    return mutator.hasErrorType
      ? `${mutator.default ? pascal(operationName) : ''}ErrorType<${errorsType}>`
      : errorsType;
  } else {
    return httpClient === OutputHttpClient.AXIOS
      ? `AxiosError<${errorsType}>`
      : errorsType;
  }
};

export const getHooksOptionImplementation = (
  isRequestOptions: boolean,
  httpClient: OutputHttpClient,
  operationName: string,
  mutator?: GeneratorMutator,
) => {
  const options =
    httpClient === OutputHttpClient.AXIOS
      ? ', axios: axiosOptions'
      : ', fetch: fetchOptions';

  return isRequestOptions
    ? `const mutationKey = ['${operationName}'];
const {mutation: mutationOptions${
        mutator
          ? mutator?.hasSecondArg
            ? ', request: requestOptions'
            : ''
          : options
      }} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }${mutator?.hasSecondArg ? ', request: undefined' : ''}${mutator ? '' : httpClient === OutputHttpClient.AXIOS ? ', axios: undefined' : ', fetch: undefined'}};`
    : '';
};

export const getMutationRequestArgs = (
  isRequestOptions: boolean,
  httpClient: OutputHttpClient,
  mutator?: GeneratorMutator,
) => {
  const options =
    httpClient === OutputHttpClient.AXIOS ? 'axiosOptions' : 'fetchOptions';

  return isRequestOptions
    ? mutator
      ? mutator?.hasSecondArg
        ? 'requestOptions'
        : ''
      : options
    : '';
};

export const getHttpFunctionQueryProps = (
  isVue: boolean,
  isAngular: boolean,
  httpClient: OutputHttpClient,
  queryProperties: string,
  props?: GetterProps,
) => {
  if (isVue && httpClient === OutputHttpClient.FETCH && queryProperties) {
    return queryProperties
      .split(',')
      .map((prop) => `unref(${prop})`)
      .join(',');
  }

  if (isAngular && queryProperties && props) {
    return props
      .map((prop) => `${prop.name}${prop.required ? '()' : '?.()'}`)
      .join(',');
  }

  return queryProperties;
};

export const getQueryHeader: ClientHeaderBuilder = (params) => {
  return params.output.httpClient === OutputHttpClient.FETCH
    ? generateFetchHeader(params)
    : '';
};
