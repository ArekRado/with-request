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
}: CreateRequestParams) => <Props, Payload, Error = {}, RequestPayload = any>({
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

  return class WithRequestHOC extends Component<Props, State<Payload, Error>> {
    constructor(props: Props) {
      super(props)
      this.state = {
        isLoading: callOnMount,
        isError: false,
        payload: null,
        error: null,
      }
    }

    componentDidMount() {
      callOnMount && callFetch(this.setState, this.props)
    }

    componentWillUnmount() {
      deleteCacheOnUnmount()
    }

    componentDidUpdate(prevProps: Props) {
      if (prevProps !== this.props && callOnProps(prevProps, this.props)) {
        callFetch(this.setState, this.props)
      }
    }

    render() {
      return createElement(WrappedComponent, {
        [dataKey]: {
          isLoading: this.state.isLoading,
          isError: this.state.isError,
          payload: this.state.payload,
          error: this.state.error,
          fetch: () => callFetch(this.setState, this.props),
        },
      })
    }
  }
}
