import _ from 'lodash'
import pluralize from 'pluralize'
import SqlString from 'sqlstring'
import { ErrIDRequired, ErrInvalidID, ErrNotUpdatableObject } from './errors'
import { Model } from './model'
import { QueryCond } from './queryCond'
import { IResourceIdentifier, IResourceObject } from './types'
import { difference } from './utils'

const DEFAULT_PAGE_SIZE = 10

function fieldMap<F> (
  model: Model<F> | IResourceObject,
  base: _.Dictionary<any> = {}
): _.Dictionary<any> {
  const fields: _.Dictionary<any> = _.merge(
    base,
    model instanceof Model
      ? model.fields
      : model.attributes
  )

  const result: _.Dictionary<any> = {}

  let key: string
  for (key in fields) {
    if (!_.has(fields, key)) {
      continue
    }
    result[_.snakeCase(key)] = fields[key]
  }

  return result
}

function tableName<F> (v: Model<F> | IResourceIdentifier | IResourceObject | string) {
  const type: string = typeof v === 'string'
    ? v
    : v.type
  return _.snakeCase(pluralize.plural(type))
}

export interface IListQueryOpts {
  page?: number
  size?: number
  cond?: QueryCond
}

export function listQuery<F> (v: Model<F> | IResourceObject, opts?: IListQueryOpts) {
  const _opts = opts || {}
  const page = _opts.page || 0
  const size = _opts.size || DEFAULT_PAGE_SIZE
  const cond = _opts.cond

  const type = v.type
  const id = v.id
  const table = tableName(type)
  if (!id) {
    throw ErrInvalidID
  }

  return SqlString.format(
    `SELECT * FROM ?? INNER JOIN (` +
    `SELECT ?? FROM ?? ${cond !== undefined ? 'WHERE ' + cond.build() : ''} LIMIT ? OFFSET ?` +
    `) AS ?? USING (??);`,
    [ table, 'id', table, size, page * size, 'result', 'id' ]
  )
}

export function insertQuery<F> (v: Model<F> | IResourceObject) {
  const id = v.id
  if (!id) {
    throw ErrIDRequired
  }
  const map = fieldMap(v, { id })
  return SqlString.format(
    `INSERT INTO ?? (??) VALUES (?);`,
    [ tableName(v), _.keysIn(map), _.valuesIn(map) ]
  )
}

export function selectQuery<F> (v: Model<F> | IResourceIdentifier | IResourceObject) {
  const type = v.type
  const id = v.id
  if (!id) {
    throw ErrInvalidID
  }
  return SqlString.format(
    `SELECT * FROM ?? WHERE ?? = ? LIMIT 1;`,
    [ tableName(type), 'id', id ]
  )
}

export function deleteQuery<F> (v: Model<F> | IResourceIdentifier | IResourceObject) {
  const type = v.type
  const id = v.id
  if (!id) {
    throw ErrInvalidID
  }
  return SqlString.format(
    `DELETE FROM ?? WHERE ?? = ?;`,
    [ tableName(type), 'id', id ]
  )
}

export function updateQuery<F> (
  v: Model<F> | IResourceIdentifier | IResourceObject,
  u: ((fields: F) => F) | _.Dictionary<any>,
  w: QueryCond
) {
  let diff: _.Dictionary<any>
  if (_.isFunction(u)) {
    if (v instanceof Model) {
      const before = v.fields
      const after = u(_.cloneDeep(v.fields))
      diff = difference(after, before)
    } else {
      throw ErrNotUpdatableObject
    }
  } else {
    diff = u
  }
  return SqlString.format(
    `UPDATE ?? SET ? WHERE ${w.build()};`,
    [ tableName(v), diff ]
  )
}
