import { createFetch } from './createFetch'

describe('createFetch', () => {
  const V = () => {}
  const N = () => null
  const fetch = () => new Promise(resolve => resolve())
  const url = () => ''
  const method = 'GET'
  const getRequestPayload = N
  const cache = { set: V, get: N }
  const headers = () => []

  it('should return function', () => {
    expect(
      typeof createFetch(cache, url, method, headers, getRequestPayload, fetch),
    ).toBe('function')
  })

  describe('cache', () => {
    it('should returns data from cache if it is not null', () => {
      const cachePayload = { test: 'test' }
      const mockedCache = { set: V, get: () => cachePayload }

      const callFetch = createFetch(
        mockedCache,
        url,
        method,
        headers,
        getRequestPayload,
        fetch,
      )
      const spy = jest.fn()

      callFetch(spy, {})

      expect(spy).toHaveBeenCalledWith({
        isLoading: false,
        isError: false,
        payload: cachePayload,
      })
    })

    it('should returns new data if cache returns null', async () => {
      const payload = { test: 'test' }
      const mockedCache = { set: V, get: N }

      const callFetch = createFetch(
        mockedCache,
        url,
        method,
        headers,
        getRequestPayload,
        () => new Promise(resolve => resolve(payload as any)),
      )
      const spy = jest.fn()

      await callFetch(spy, {})

      expect(spy.mock.calls[1][0]).toMatchObject({
        isLoading: false,
        isError: false,
        payload: payload,
      })
    })

    it('should call cache setter', async () => {
      const spy = jest.fn()
      const payload = { test: 'test' }
      const mockedCache = { set: spy, get: N }

      const callFetch = createFetch(
        mockedCache,
        url,
        method,
        headers,
        getRequestPayload,
        () => new Promise(resolve => resolve(payload as any)),
      )

      await callFetch(() => {}, {})

      expect(spy.mock.calls[0][2]).toMatchObject(payload)
    })
  })

  describe('errors', () => {
    it('should setState with error when fetch throws error', async () => {
      const error = 'ERROR!!'
      const mockedCache = { set: V, get: N }

      const callFetch = createFetch(
        mockedCache,
        url,
        method,
        headers,
        getRequestPayload,
        () => new Promise((_, reject) => reject(error as any)),
      )
      const spy = jest.fn()

      await callFetch(spy, {})

      expect(spy.mock.calls[1][0]).toMatchObject({
        isLoading: false,
        isError: true,
        error,
      })
    })
  })
})
