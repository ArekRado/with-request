# withRequest

HOC to call cacheable requests

```
npm i with-request
```

```
yarn add with-request
```

# Table of Contents

1. [Params](#Params)
2. [Examples](#Examples)
3. [Usage with axios](#Usage-with-axios)
4. [Usage with fetch](#Usage-with-fetch)

## Params

### **createRequest** - returns withRequest

| Params | Types                                                                             | Default value | Description                                                                           |
| ------ | --------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------- |
| fetch  | (param: {url: string, method: string, requestPayload: any}) => Promise< Payload > | -             | Used to communicate with eg: axios or fetch.                                          |
| cancel | () => void                                                                        | () => {}      | **IN PROGRESS** - Called when request is in progress but component has been unmounted |

### **withRequest**

| Params               | Types                                       | Default value                      | Description                                                                                                    |
| -------------------- | ------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| url                  | (props: Props) => string                    | -                                  | Used to create request url based on component props                                                            |
| method               | string                                      | 'GET'                              | Request type                                                                                                   |
| getRequestPayload    | (props: Props) => any                       | () => null                         | Used to create request body based on component props                                                           |
| callOnProps          | (props: Props, prevProps: Props) => boolean | () => false                        | Will call request when return true - uses componentDidUpdate to detect updates                                 |
| callOnMount          | boolean                                     | true                               | Call request on componentDidMount                                                                              |
| cache                | (Check cache example)                       | { set: () => {}, get: () => null } | set - called after each successful fetch. get - HOC uses returned value from `get` as payload (if is not null) |
| deleteCacheOnUnmount | () => void                                  | () => {}                           | Called on unmount, useful to clean unused cache                                                                |

## Examples

Basic:

```js
withRequest({ url: () => '//your.api/products' })(YourAwesomeComponent)
```

Customizable url:

```js
withRequest({ url: ({ id }) => `//your.api/products/${id}` })(
  YourAwesomeComponent,
)
```

POST with payload:

```js
withRequest({
  url: ({ id }) => `//your.api/products/${id}`,
  method: 'POST',
  getRequestPayload: ({ newProductName }) => ({ name: newProductName })
})(YourAwesomeComponent)
```

Call request on props change:

```js
withRequest({
  url: () => '//your.api/products',
  callOnProps: (props, prevProps) => props.page !== prevProps.page,
})(YourAwesomeComponent)
```

Cache usage example:

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

```js
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

```js
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
