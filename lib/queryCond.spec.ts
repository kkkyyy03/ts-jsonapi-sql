import { expect } from 'chai'
import { QueryCond } from './queryCond'

describe('#QueryCond', () => {
  it('is', () => {
    expect(new QueryCond('key').is('value').build())
      .to.be.equals("`key` = 'value'")
  })
  it('not is', () => {
    expect(new QueryCond('key').not.is('value').build())
      .to.be.equals("NOT `key` = 'value'")
  })
  it('like', () => {
    expect(new QueryCond('key').like('value').build())
      .to.be.equals("`key` LIKE 'value'")
  })
  it('not like', () => {
    expect(new QueryCond('key').not.like('value').build())
      .to.be.equals("NOT `key` LIKE 'value'")
  })
  it('toggle `not`', () => {
    expect(new QueryCond('key').not.not.is('value').build())
      .to.be.equals("`key` = 'value'")
  })
  it('or', () => {
    expect(
      new QueryCond('key').is('value')
        .or(new QueryCond('key').is('value'))
        .build()
    ).to.be.equals("`key` = 'value' OR `key` = 'value'")
  })
  it('and', () => {
    expect(
      new QueryCond('key').is('value')
        .and(new QueryCond('key').is('value'))
        .build()
    ).to.be.equals("`key` = 'value' AND `key` = 'value'")
  })
})
