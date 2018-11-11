import { createElement, ComponentType, Component } from 'react'

const V = () => {}
const F = () => false
const N = () => null

type Params<Props, Payload, RequestPayload> = {
  url: (props: Props) => string
  method?: string
  requestPayload?: (props: Props) => RequestPayload | null
  callOnProps?: (props: Props, nextProps: Props) => boolean
  callOnMount?: boolean
  cache?: Cache<Props, Payload, RequestPayload>
  deleteCacheOnUnmount?: () => void
}

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

type RequestData<RequestPayload> = {
  url: string
  method: string
  requestPayload: RequestPayload | null
}

type CreateRequestParams = {
  fetch: (
    param: {
      url: string
      method: string
      requestPayload: any
    },
  ) => Promise<any>
  cancel?: () => void
}

type State<Payload, Error> = {
  isLoading: boolean
  isError: boolean
  payload: Payload | null
  error: Error | null
}

export const createRequest = ({
  fetch,
  cancel = () => {},
}: CreateRequestParams) => <Props, Payload, Error = {}, RequestPayload = any>({
  url,
  method = 'GET',
  requestPayload = N,
  callOnProps = F,
  callOnMount = true,
  cache = { set: V, get: N },
  deleteCacheOnUnmount = V,
}: Params<Props, Payload, RequestPayload>) => (
  WrappedComponent: ComponentType<any>,
) => {
  return class WithRequestHOC extends Component<Props, State<Payload, Error>> {
    constructor(props: Props) {
      super(props)
      this.state = {
        isLoading: callOnMount,
        isError: false,
        payload: null,
        error: null,
      }

      this.fetch = this.fetch.bind(this)
    }

    componentDidMount() {
      callOnMount && this.fetch()
    }

    componentWillUnmount() {
      deleteCacheOnUnmount()
    }

    componentDidUpdate(prevProps: Props) {
      if (prevProps !== this.props && callOnProps(prevProps, this.props)) {
        this.fetch()
      }
    }

    async fetch() {
      const requestData: RequestData<RequestPayload> = {
        url: url(this.props),
        method,
        requestPayload: requestPayload(this.props),
      }

      const cachePayload = cache.get(this.props, requestData)
      console.log('cachePayload', cachePayload)
      if (cachePayload === null) {
        try {
          this.setState({ isLoading: true })
          const payload = await fetch(requestData)

          cache.set(this.props, requestData, payload)

          this.setState({
            payload,
            isLoading: false,
            isError: false,
          })
        } catch (error) {
          this.setState({ isLoading: false, isError: true, error })
        }
      } else {
        this.setState({
          isLoading: false,
          isError: false,
          payload: cachePayload,
        })
      }
    }

    render() {
      return createElement(WrappedComponent, {
        request: {
          isLoading: this.state.isLoading,
          isError: this.state.isError,
          payload: this.state.payload,
          error: this.state.error,
          fetch: this.fetch,
        },
      })
    }
  }
}
