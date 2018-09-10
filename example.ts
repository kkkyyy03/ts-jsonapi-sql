import {
  deleteQuery,
  ILinkMap,
  IMetaMap,
  insertQuery,
  IResourceIdentifierMap,
  Model, QueryCond, searchQuery, selectQuery, updateQuery
} from './lib'

interface IFields {
  name: string
}

class Company extends Model<IFields> {
  public constructor (f: IFields) {
    super('company', 'some-id', f)
  }

  public get relationships (): IResourceIdentifierMap {
    return {}
  }

  public get links (): ILinkMap {
    return {}
  }

  public get meta (): IMetaMap {
    return {}
  }
}

const withmetoday = new Company({
  name: 'WithmeToday'
})

const anotherCompany = new Company({
  name: 'AnotherCompany'
})

// WithmeToday
console.log(withmetoday.fields.name)

// INSERT INTO `companies` (`id`, `name`) VALUES ('some-id', 'WithmeToday')
console.log(insertQuery(withmetoday))

// SELECT * FROM `companies` WHERE `id` = 'id'
console.log(selectQuery({ type: 'company', id: 'id' }))

// SELECT * FROM `companies` WHERE NOT `name` = 'WithmeToday'
console.log(searchQuery(
  'company',
  new QueryCond('name').not.is('WithmeToday')
))

// SELECT * FROM `companies` WHERE `name` LIKE 'Withme%' OR `name` LIKE '%Company'
console.log(searchQuery(
  'company',
  new QueryCond('name').like('Withme%')
    .or(new QueryCond('name').like('%Company'))
))

// DELETE FROM `companies` WHERE `id` = 'some-id'
console.log(deleteQuery(withmetoday))

// UPDATE `companies` SET `name` = 'With me Today' WHERE `name` = 'WithmeToday'
// Caution: model not update.
console.log(updateQuery(withmetoday, (fields: IFields): IFields => {
  fields.name = 'With me Today'
  return fields
}, new QueryCond('name').is('WithmeToday')))

// UPDATE `table` SET `name` = 'With me Today' WHERE `name` = 'WithmeToday'
console.log(updateQuery(withmetoday, withmetoday.update((fields: IFields): IFields => {
  fields.name = 'With me Today'
  return fields
}), new QueryCond('name').is('WithmeToday')))
