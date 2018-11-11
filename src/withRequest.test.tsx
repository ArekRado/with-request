import * as React from 'react'
import { configure, shallow, mount } from 'enzyme'
import { createRequest } from './withRequest'

import * as Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

describe('withRequest', () => {
  const emptyResponse = new Promise(resolve => setTimeout(() => resolve(), 0))

  describe('createRequest', () => {
    it('Should returns function', () => {
      const withRequest = createRequest({ fetch: () => emptyResponse })
      expect(typeof withRequest).toBe('function')
    })
  })

  describe('HOC', () => {
    const BasicComponent: React.FunctionComponent = () => null

    it('Should returns enhanced component with additional props', () => {
      const withEmptyRequest = createRequest({ fetch: () => emptyResponse })

      const WrappedComponent = withEmptyRequest({ url: () => '' })(
        BasicComponent,
      )

      const rendered = shallow(<WrappedComponent />)
      const { request } = rendered.props()

      expect(typeof request.fetch).toBe('function')
      expect(request.error).toBe(null)
      expect(request.payload).toBe(null)
      expect(request.isError).toBe(false)
      expect(request.isLoading).toBe(true)
    })

    describe('callOnMount', () => {
      it('Should call fetch on mount by default', () => {
        const spy = jest.fn(() => null)
        const withEmptyRequest = createRequest({
          fetch: () =>
            new Promise(resolve => {
              spy()
              resolve()
            }),
        })

        const WrappedComponent = withEmptyRequest({ url: () => '' })(
          BasicComponent,
        )

        mount(<WrappedComponent />)

        expect(spy).toHaveBeenCalled()
      })

      it('Should not call fetch on mount when callOnMount is false', () => {
        const spy = jest.fn(() => null)
        const withEmptyRequest = createRequest({
          fetch: () =>
            new Promise(resolve => {
              spy()
              resolve()
            }),
        })

        const WrappedComponent = withEmptyRequest({
          url: () => '',
          callOnMount: false,
        })(BasicComponent)

        mount(<WrappedComponent />)

        expect(spy).not.toHaveBeenCalled()
      })
    })

    it('Should deleteCacheOnUnmount call on unmount when is set', () => {
      const spy = jest.fn(() => null)
      const withEmptyRequest = createRequest({ fetch: () => emptyResponse })

      const WrappedComponent = withEmptyRequest({
        url: () => '',
        deleteCacheOnUnmount: spy,
      })(BasicComponent)

      const rendered = mount(<WrappedComponent />)
      rendered.unmount()

      expect(spy).toHaveBeenCalled()
    })

    describe('callOnProps', () => {
      it('Should not call fetch when props doesn not changed', () => {
        const spy = jest.fn(() => null)
        const withEmptyRequest = createRequest({
          fetch: () =>
            new Promise(resolve => {
              spy()
              resolve()
            }),
        })

        const WrappedComponent = withEmptyRequest({
          url: () => '',
          callOnMount: false,
        })(BasicComponent)

        const rendered = mount(<WrappedComponent />)
        rendered.update()

        expect(spy).not.toHaveBeenCalled()
      })

      it('Should not call fetch by default when props has been changed', () => {
        const spy = jest.fn(() => null)
        const withEmptyRequest = createRequest({
          fetch: () =>
            new Promise(resolve => {
              spy()
              resolve()
            }),
        })

        const WrappedComponent = withEmptyRequest({
          url: () => '',
          callOnMount: false,
        })(BasicComponent)

        const rendered = mount(<WrappedComponent />)
        rendered.setProps({ test: 123 })
        rendered.update()

        expect(spy).not.toHaveBeenCalled()
      })

      it('Should call fetch when props has been changed and callOnProps returns true', () => {
        const spy = jest.fn(() => null)
        const withEmptyRequest = createRequest({
          fetch: () =>
            new Promise(resolve => {
              spy()
              resolve()
            }),
        })

        const WrappedComponent = withEmptyRequest({
          url: () => '',
          callOnMount: false,
          callOnProps: () => true,
        })(BasicComponent)

        const rendered = mount(<WrappedComponent />)
        rendered.setProps({ test: 123 })
        rendered.update()

        expect(spy).toHaveBeenCalled()
      })
    })

    describe('cache', () => {
      it('Should return data from cache if is defined', () => {
        const withEmptyRequest = createRequest({ fetch: () => emptyResponse })

        const WrappedComponent = withEmptyRequest({
          url: () => '',
          cache: {
            set: () => {},
            get: () => 'test',
          },
        })(BasicComponent)

        const rendered = shallow(<WrappedComponent />)

        const { request } = rendered.props()
        expect(request.payload).toBe('test')
      })
    })

    // it('Should catch error and set isError flag', async () => {
    //   const withEmptyRequest = createRequest({
    //     fetch: () => new Promise((_, reject) => reject('error')),
    //   })

    //   const WrappedComponent = withEmptyRequest({
    //     url: () => '',
    //   })(BasicComponent)

    //   const { request } = mount(<WrappedComponent />)
    //     .children()
    //     .props()

    //   expect(request.isError).toBe(true)
    //   expect(request.error).toBe('error')
    // })
  })
})
