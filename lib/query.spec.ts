/* tslint:disable:max-line-length */
import { expect } from 'chai'
import { Model } from './model'
import { deleteQuery, insertQuery, listQuery, selectQuery, updateQuery } from './query'
import { QueryCond } from './queryCond'
import { ILinkMap, IMetaMap, IResourceIdentifierMap } from './types'

const id = Date.now().toString()

interface IFields {
  key: string
}

class TestModel extends Model<IFields> {
  public relationships: IResourceIdentifierMap = {
    rel: {
      type: 'type',
      id
    }
  }

  public links: ILinkMap = {
    self: 'https://localhost/test'
  }

  public meta: IMetaMap = {
    key: 'value'
  }

  public constructor (fields: IFields) {
    super('test', id, fields)
  }
}

const sampleFields = {
  key: 'value'
}

describe('#Query', () => {
  it('List query', () => {
    expect(listQuery(new TestModel(sampleFields)).replace(/\s+/g, ' '))
      .to.be.equals('SELECT * FROM `tests` INNER JOIN ( SELECT `id` FROM `tests` LIMIT 10 OFFSET 0 ) AS `result` USING (`id`);')
  })
  it('List query with Single Sort', () => {
    expect(listQuery(new TestModel(sampleFields), { sort: [ 'key' ] }).replace(/\s+/g, ' '))
      .to.be.equals('SELECT * FROM `tests` INNER JOIN ( SELECT `id` FROM `tests` ORDER BY `key` LIMIT 10 OFFSET 0 ) AS `result` USING (`id`);')
  })
  it('List query with Many Sort', () => {
    expect(listQuery(new TestModel(sampleFields), { sort: [ 'id', 'key' ] }).replace(/\s+/g, ' '))
      .to.be.equals('SELECT * FROM `tests` INNER JOIN ( SELECT `id` FROM `tests` ORDER BY `id`, `key` LIMIT 10 OFFSET 0 ) AS `result` USING (`id`);')
  })
  it('Search query', () => {
    expect(listQuery(new TestModel(sampleFields), { cond: new QueryCond('id').is('id') }).replace(/\s+/g, ' '))
      .to.be.equals('SELECT * FROM `tests` INNER JOIN ( SELECT `id` FROM `tests` WHERE `id` = \'id\' LIMIT 10 OFFSET 0 ) AS `result` USING (`id`);')
  })
  it('Search query with Sort', () => {
    expect(listQuery(new TestModel(sampleFields), { cond: new QueryCond('id').is('id'), sort: [ 'key' ] }).replace(/\s+/g, ' '))
      .to.be.equals('SELECT * FROM `tests` INNER JOIN ( SELECT `id` FROM `tests` WHERE `id` = \'id\' ORDER BY `key` LIMIT 10 OFFSET 0 ) AS `result` USING (`id`);')
  })
  it('Insert query', () => {
    expect(insertQuery(new TestModel(sampleFields)))
      .to.be.equals("INSERT INTO `tests` (`id`, `key`) VALUES ('" + id + "', 'value');")
  })
  it('Select query', () => {
    expect(selectQuery(new TestModel(sampleFields)))
      .to.be.equals("SELECT * FROM `tests` WHERE `id` = '" + id + "' LIMIT 1;")
  })
  it('Delete query', () => {
    expect(deleteQuery(new TestModel(sampleFields)))
      .to.be.equals("DELETE FROM `tests` WHERE `id` = '" + id + "';")
  })
  it('Update query', () => {
    expect(updateQuery(new TestModel(sampleFields), (f: IFields) => {
      f.key = 'edited'
      return f
    }, new QueryCond('id').is(id)))
      .to.be.equals("UPDATE `tests` SET `key` = 'edited' WHERE `id` = '" + id + "';")
  })
  it('Update query with update log', () => {
    const model = new TestModel(sampleFields)
    expect(updateQuery(model, model.update((f: IFields) => {
      f.key = 'edited'
      return f
    }), new QueryCond('id').is(id)))
      .to.be.equals("UPDATE `tests` SET `key` = 'edited' WHERE `id` = '" + id + "';")
  })
})
