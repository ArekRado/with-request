# withRequest

HOC to call cacheable requests

```
npm i with-request
```

```
yarn add with-request
```

1. [Params](#Params)
2. [Examples](#Examples)
3. [Usage with axios](#Usage-with-axios)
4. [Usage with fetch](#Usage-with-fetch)

## Params

### **createRequest** - used to connect with api adapters (fetch, axios) and cancel requests. Returns withRequest HOC

```ts
type CreateRequest = (
  params: {
    fetch: () => Promise<any>
    cancel?: () => void
  },
) => WithRequest
```

- fetch - called on componentDidMount, componentDidUpdate, available in enhanced component props

```ts
type Fetch = (
  params: {
    url: string
    method: string
    headers: HeadersInit
    requestPayload: any
  },
) => Promise<any>
```

- cancel - called on componentWillUnmount, componentDidUpdate, available in enhanced component props

```ts
type Cancel = (
  params: {
    url: string
    method: string
    headers: HeadersInit
    requestPayload: any
  },
) => void
```

### **withRequest**

```ts
withRequest<Props, Payload, Error = {}, RequestPayload = any, FetchParams = any>({
  url: (props: Props, fetchParams: any) => string
  headers?: (props: Props) => HeadersInit
  method?: string
  dataKey?: string
  getRequestPayload?: (props: Props, fetchParams: FetchParams) => RequestPayload | null
  callOnProps?: (props: Props, nextProps: Props) => boolean
  callOnMount?: boolean
  cache?: { set: () => void, get = () => null }
  deleteCacheOnUnmount?: () => void
  cancelOnUnmount?: boolean
  cancelOnProps?: (props: Props, nextProps: Props) => boolean
})
```

default params:

```ts
type withRequestParams = {
  method = 'GET',
  headers = () => [],
  dataKey = 'request',
  getRequestPayload = () => null,
  callOnProps = () => false,
  callOnMount = true,
  cache = { set: () => {}, get: () => null },
  deleteCacheOnUnmount = () => {},
  cancelOnUnmount = true,
  cancelOnProps = () => false,
}
```

- url - Used to create request url based on component props

```ts
type Url<Props, FetchParams> = (
  props: Props,
  fetchParams: FetchParams,
) => string
```

- method - request method

```ts
type Method = string
```

- headers - request headers

```ts
type Headers = HeadersInit
```

- dataKey - prop name when request data should be injected

```ts
type DataKey = string
```

- getRequestPayload - Used to create request body based on component props

```ts
type GetRequestPayload<Props, RequestPayload, FetchParams> = (
  props: Props,
  fetchParams: FetchParams,
) => RequestPayload | null
```

- callOnProps - Calls fetch when return true - uses componentDidUpdate to detect updates

```ts
type CallOnProps = (props: Props, nextProps: Props) => boolean
```

- cache - local cache configuration.
  set - called after each successful fetch.
  get - HOC uses returned value from get as payload. Will not call fetch if returns is different than null.

```ts
type Cache<Props, Payload, RequestPayload> = {
  set: (
    props: Props,
    requestData: RequestData<RequestPayload>,
    payload: Payload,
  ) => void
  get: (
    props: Props,
    requestData: RequestData<RequestPayload>,
  ) => Payload | null
}
```

- deleteCacheOnUnmount - useful to clean cache on unmounting component

```ts
type DeleteCacheOnUnmount = () => void
```

- cancelOnUnmount - determines if should call cancel on unmount

```ts
type cancelOnUnmount = boolean
```

- cancelOnProps - calls cancel when return true - uses componentDidUpdate to detect updates

```ts
type cancelOnProps = () => boolean
```

## Examples

Basic:

```ts
withRequest({ url: () => '//your.api/products' })(YourAwesomeComponent)
```

Customizable url:

```ts
withRequest({ url: ({ id }) => `//your.api/products/${id}` })(
  YourAwesomeComponent,
)
```

POST with payload:

```ts
withRequest({
  url: ({ id }) => `//your.api/products/${id}`,
  method: 'POST',
  getRequestPayload: ({ newProductName }) => ({ name: newProductName }),
})(YourAwesomeComponent)
```

Call request on props change:

```ts
withRequest({
  url: () => '//your.api/products',
  callOnProps: (props, prevProps) => props.page !== prevProps.page,
})(YourAwesomeComponent)
```

Cache usage example:

```ts
const timeCache = (seconds: number) => {
  const duration = 1000 * seconds
  let timer = performance.now()
  let cache = null

  return {
    set: (props, requestData, payload) => {
      cache = payload
    },
    get: (props, requestData) => {
      if (performance.now() - timer >= duration) {
        cache = null
        timer = performance.now()
      }
      return cache
    },
  }
}

withRequest({
  url: () => '//your.api/products',
  cache: timeCache(60),
})(YourAwesomeComponent)
```

## Usage with axios

```ts
const withRequest = createRequest({
  fetch: params =>
    axios({
      method: params.method,
      url: params.url,
      data: params.requestPayload,
    }),
})

withRequest({ url: () => '//your.api/products' })(YourAwesomeComponent)
```

## Usage with fetch

```ts
const withRequest = createRequest({
  fetch: params => {
    const response =
      params.method === 'GET'
        ? fetch(params.url)
        : fetch(params.url, {
            method: params.method,
            body: JSON.stringify(params.requestPayload),
          })

    return response.then(response => response.json())
  },
})

withRequest({ url: () => '//your.api/products' })(YourAwesomeComponent)
```
