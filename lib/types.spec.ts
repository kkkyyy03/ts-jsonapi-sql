import { expect } from 'chai'
import { flatFrom, isResourceObject } from './types'

describe('#Types Helper', () => {
  it('FlatObject is not ResourceObject', () => {
    expect(isResourceObject({
      id: 'aa',
      type: 'bb',
      other: 'cc'
    })).to.be.equal(false)
  })

  it('FlatObject from MySQL Result should be OK', () => {
    expect(flatFrom('type', {
      id: 'id',
      bb: 'bb'
    })).to.be.deep.equal({
      type: 'type',
      id: 'id',
      bb: 'bb'
    })
  })
})
