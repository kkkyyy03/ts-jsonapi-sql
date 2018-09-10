import { expect } from 'chai'
import { Model } from './model'
import { deleteQuery, insertQuery, searchQuery, selectQuery, updateQuery } from './query'
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
  it('Insert query', () => {
    expect(insertQuery(new TestModel(sampleFields)))
      .to.be.equals("INSERT INTO `tests` (`id`, `key`) VALUES ('" + id + "', 'value');")
  })
  it('Select query', () => {
    expect(selectQuery(new TestModel(sampleFields)))
      .to.be.equals("SELECT * FROM `tests` WHERE `id` = '" + id + "' LIMIT 1;")
  })
  it('Search query', () => {
    expect(searchQuery(new TestModel(sampleFields), new QueryCond('id').is(id)))
      .to.be.equals("SELECT * FROM `tests` WHERE `id` = '" + id + "';")
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
