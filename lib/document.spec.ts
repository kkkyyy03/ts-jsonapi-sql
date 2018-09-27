import { expect } from 'chai'
import { Document } from './document'
import { ErrInvalidJSON } from './errors'

describe('#Document', () => {
  it('New Document with JSON data that contain `data`', () => {
    const doc = new Document({
      data: {
        id: 'id',
        type: 'type'
      }
    })
    expect(doc.data).to.be.deep.equals([{
      id: 'id',
      type: 'type'
    }])
  })

  it('New Document with JSON data that contain `error`', () => {
    const doc = new Document({
      error: 'critical error!'
    })
    expect(doc.error).to.be.an('error')
  })

  it('New Document with JSON data that contain both of `data` and `error` should throws an error', () => {
    expect(() => {
      const doc = new Document({
        data: {
          id: 'id',
          type: 'type'
        },
        error: 'critical error!'
      })
    }).to.throw(ErrInvalidJSON)
  })

  it('New Document with empty JSON data should throws an error', () => {
    expect(() => {
      const doc = new Document({})
    }).to.throw(ErrInvalidJSON)
  })

  it('Add the flat object should be OK', () => {
    const doc = new Document()
    doc.add({
      id: 'id',
      type: 'type',
      someKey: 'key'
    })
    expect(doc.data).to.be.deep.equals([{
      id: 'id',
      type: 'type',
      attributes: {
        someKey: 'key'
      }
    }])
  })
})
