import { Fetch, GetRequestPayload, Url, Cache } from './interfaces'
import { Component } from 'react'

export const createFetch = <Props, Payload, RequestPayload>(
  cache: Cache<Props, Payload, RequestPayload>,
  url: Url<Props, any>,
  method: string,
  headers: (props: Props) => HeadersInit,
  getRequestPayload: GetRequestPayload<Props, RequestPayload, any>,
  fetch: Fetch<Payload, RequestPayload>,
) => async (
  setState: Component['setState'],
  props: Props,
  fetchParams?: any,
) => {
  const requestData = {
    url: url(props, fetchParams),
    method,
    headers: headers(props),
    requestPayload: getRequestPayload(props, fetchParams),
  }
  const cachePayload = cache.get(props, requestData)
  if (cachePayload === null) {
    try {
      setState({ isLoading: true })

      const payload = await fetch(requestData)

      cache.set(props, requestData, payload)

      setState({
        payload,
        isLoading: false,
        isError: false,
      })
    } catch (error) {
      setState({ isLoading: false, isError: true, error })
    }
  } else {
    setState({
      isLoading: false,
      isError: false,
      payload: cachePayload,
    })
  }
}
