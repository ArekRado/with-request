import { ComponentType } from 'react'

export type Url<Props, FetchParams> = (
  props: Props,
  fetchParams: FetchParams | null,
) => string

export type GetRequestPayload<Props, RequestPayload, FetchParams> = (
  props: Props,
  fetchParams: FetchParams,
) => RequestPayload | null

export type WithFetchParams<Props, Payload, RequestPayload, FetchParams> = {
  url: Url<Props, FetchParams>
  headers?: (props: Props) => HeadersInit
  method?: string
  dataKey?: string
  getRequestPayload?: GetRequestPayload<
    Props,
    RequestPayload,
    FetchParams | null
  >
  callOnProps?: (props: Props, nextProps: Props) => boolean
  callOnMount?: boolean
  cache?: Cache<Props, Payload, RequestPayload>
  deleteCacheOnUnmount?: () => void
  cancelOnUnmount?: boolean
  cancelOnProps?: (props: Props, nextProps: Props) => boolean
}

export type Cache<Props, Payload, RequestPayload> = {
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

export type RequestData<RequestPayload> = {
  url: string
  method: string
  headers: HeadersInit
  requestPayload: RequestPayload | null
}

export type Fetch<Payload, RequestPayload> = (
  param: RequestData<RequestPayload>,
) => Promise<Payload>

export type CreateRequestParams = {
  fetch: Fetch<any, any>
  cancel?: (params: RequestData<any>) => void
}

export type State<Payload, Error> = {
  isLoading: boolean
  isError: boolean
  payload: Payload | null
  error: Error | null
}

export type InjectedProps<Payload = null, Error = null, FetchParams = null> = {
  [key in string]: {
    fetch: (params: FetchParams) => Promise<void>
  } & State<Payload, Error>
}

export type WrappedComponentType<
  Props,
  Payload,
  Error,
  FetchParams
> = ComponentType<InjectedProps<Payload, Error, FetchParams> | Props>
