import { createElement, Component } from 'react'

import { createFetch } from './createFetch'

import {
  WithFetchParams,
  State,
  WrappedComponentType,
  CreateRequestParams,
} from './interfaces'

const V = () => {}
const F = () => false
const N = () => null
const A = () => []

export const createRequest = ({ fetch, cancel = V }: CreateRequestParams) => <
  Props,
  Payload,
  Error = {},
  RequestPayload = any,
  FetchParams = any
>({
  url,
  method = 'GET',
  headers = A,
  dataKey = 'request',
  getRequestPayload = N,
  callOnProps = F,
  callOnMount = true,
  cache = { set: V, get: N },
  deleteCacheOnUnmount = V,
  cancelOnUnmount = true,
  cancelOnProps = F,
}: WithFetchParams<Props, Payload, RequestPayload, FetchParams>) => (
  WrappedComponent: WrappedComponentType<Props, Payload, RequestPayload, Error>,
) => {
  const callFetch = createFetch(
    cache,
    url,
    method,
    headers,
    getRequestPayload,
    fetch,
  )

  const prepareRequestData = (props: Props, fetchParams?: FetchParams) => ({
    url: url(props, fetchParams),
    method,
    headers: headers(props),
    requestPayload: getRequestPayload(props, fetchParams || null),
  })

  let isMounted = false

  return class WithRequestHOC extends Component<Props, State<Payload, Error>> {
    constructor(props: Props) {
      super(props)

      this.setState = this.setState.bind(this)
      this.safeSetState = this.safeSetState.bind(this)

      this.state = {
        isLoading: callOnMount,
        isError: false,
        payload: null,
        error: null,
      }
    }

    componentDidMount() {
      isMounted = true
      callOnMount && callFetch(this.safeSetState, this.props)
    }

    componentWillUnmount() {
      isMounted = false
      cancelOnUnmount && cancel(prepareRequestData(this.props))
      deleteCacheOnUnmount()
    }

    componentDidUpdate(prevProps: Props) {
      if (prevProps !== this.props) {
        if (callOnProps(prevProps, this.props)) {
          callFetch(this.safeSetState, this.props)
        }

        if (cancelOnProps(prevProps, this.props)) {
          cancel(prepareRequestData(this.props))
        }
      }
    }

    safeSetState(data: State<Payload, Error>) {
      isMounted && this.setState(data)
    }

    render() {
      const injectedProps = {
        [dataKey]: {
          isLoading: this.state.isLoading,
          isError: this.state.isError,
          payload: this.state.payload,
          error: this.state.error,
          fetch: (params: FetchParams) =>
            callFetch(this.safeSetState, this.props, params),
          cancel: (params: FetchParams) =>
            cancel(prepareRequestData(this.props, params)),
        },
      }

      return createElement(
        WrappedComponent,
        Object.assign({}, this.props, injectedProps),
      )
    }
  }
}
