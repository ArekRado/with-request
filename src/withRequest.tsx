import { createElement, Component } from 'react'

import { createFetch } from './createFetch'

import {
  WithFetchParams,
  State,
  WrappedComponentType,
  CreateRequestParams,
} from './typings'

const V = () => {}
const F = () => false
const N = () => null

export const createRequest = ({
  fetch,
  cancel = () => {},
}: CreateRequestParams) => <
  Props,
  Payload,
  Error = {},
  RequestPayload = any,
  FetchParams = any
>({
  url,
  method = 'GET',
  dataKey = 'request',
  getRequestPayload = N,
  callOnProps = F,
  callOnMount = true,
  cache = { set: V, get: N },
  deleteCacheOnUnmount = V,
}: WithFetchParams<Props, Payload, RequestPayload>) => (
  WrappedComponent: WrappedComponentType<Props, Payload, RequestPayload, Error>,
) => {
  const callFetch = createFetch(cache, url, method, getRequestPayload, fetch)
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
      callOnMount && callFetch(this.safeSetState, this.props, () => isMounted)
    }

    componentWillUnmount() {
      isMounted = false
      cancel()
      deleteCacheOnUnmount()
    }

    componentDidUpdate(prevProps: Props) {
      if (prevProps !== this.props && callOnProps(prevProps, this.props)) {
        callFetch(this.safeSetState, this.props)
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
          cancel: () => cancel()
        },
      }

      return createElement(
        WrappedComponent,
        Object.assign({}, this.props, injectedProps),
      )
    }
  }
}
