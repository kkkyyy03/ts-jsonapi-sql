import _ from 'lodash'
import pluralize from 'pluralize'
import SqlString from 'sqlstring'
import { ILinkMap, IMetaObject, IResourceIdentifierMap, IResourceObject } from './types'

export class Model <F> {
  public type: string
  public id?: string
  public readonly fields: F

  constructor (type: string, fields: F) {
    this.type = type
    this.fields = fields
  }

  // noinspection JSMethodCanBeStatic
  public get relationships (): IResourceIdentifierMap | undefined {
    return undefined
  }

  // noinspection JSMethodCanBeStatic
  public set relationships (m: IResourceIdentifierMap | undefined) {
    throw new Error('method "set relationships" is not implemented')
  }

  // noinspection JSMethodCanBeStatic
  public get links (): ILinkMap | undefined {
    return undefined
  }

  // noinspection JSMethodCanBeStatic
  public set links (m: ILinkMap | undefined) {
    throw new Error('method "set links" is not implemented')
  }

  // noinspection JSMethodCanBeStatic
  public get meta (): IMetaObject | undefined {
    return undefined
  }

  // noinspection JSMethodCanBeStatic
  public set meta (m: IMetaObject | undefined) {
    throw new Error('method "set meta" is not implemented')
  }

  public pack (): IResourceObject {
    const result: IResourceObject = {
      type: this.type,
      id: this.id,
      relationships: this.relationships,
      links: this.links,
      meta: this.meta
    }
    result.attributes = this.fields
    return result
  }

  public unpack (v: IResourceObject) {
    this.type = v.type
    this.id = v.id
    for (const key in this.fields) {
      if (!this.fields.hasOwnProperty(key)) {
        continue
      }
      if (!_.has(v, key)) {
        continue
      }
      this.fields[key] = (v as any)[key]
    }
  }

  public insertQuery () {
    const map = this.SQLMap({ id: this.id })
    return SqlString.format(
      `INSERT INTO ?? (??) VALUES (?);`,
      [ this.table(), _.keysIn(map), _.valuesIn(map) ]
    )
  }

  public selectQuery () {
    return SqlString.format(
      `SELECT * FROM ?? WHERE ? LIMIT 1;`,
      [ this.table(), { id: this.id } ]
    )
  }

  public searchQuery () {
    return SqlString.format(
      `SELECT * FROM ?? WHERE ?;`,
      [ this.table(), this.SQLMap() ]
    )
  }

  public deleteQuery () {
    return SqlString.format(
      `DELETE FROM ?? WHERE ?;`,
      [ this.table(), { id: this.id } ]
    )
  }

  public updateQuery (updater: (fields: F) => Model<F>) {
    const after = updater(this.fields)
    return SqlString.format(
      `UPDATE ?? SET ? WHERE ?;`,
      [ this.table(), after.SQLMap(), this.SQLMap()]
    )
  }

  private table () {
    return pluralize.plural(this.type)
  }

  private SQLMap (base: { [key: string]: any } = {}): { [key: string]: any } {
    return _.merge(base, this.fields)
  }
}
