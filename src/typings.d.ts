import { ComponentType, Component } from 'react'
import { checkPropTypes } from 'prop-types';

type Url<Props> = (props: Props) => string
type GetRequestPayload<Props, RequestPayload> = (
  props: Props,
) => RequestPayload | null

export type WithFetchParams<Props, Payload, RequestPayload> = {
  url: Url<Props>
  method?: string
  dataKey?: string
  getRequestPayload?: (props: Props) => RequestPayload | null
  callOnProps?: (props: Props, nextProps: Props) => boolean
  callOnMount?: boolean
  cache?: Cache<Props, Payload, RequestPayload>
  deleteCacheOnUnmount?: () => void
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
  requestPayload: RequestPayload | null
}

export type Fetch<Payload, RequestPayload> = (
  param: RequestData<RequestPayload>,
) => Promise<Payload>

export type CreateRequestParams = {
  fetch: Fetch<any, any>
  cancel?: () => void
}

export type State<Payload, Error> = {
  isLoading: boolean
  isError: boolean
  payload: Payload | null
  error: Error | null
}

export type InjectedProps<Payload, RequestPayload, Error> = {
  [key in string]: {
    fetch: () => Promise<void>
  } & State<Payload, Error>
}

export type WrappedComponentType<
  Props,
  Payload,
  RequestPayload,
  Error
> = ComponentType<InjectedProps<Payload, RequestPayload, Error> | Props>
