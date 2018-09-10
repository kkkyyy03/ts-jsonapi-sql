import _ from 'lodash'
import { ErrFieldsRequired, ErrIDRequired } from './errors'
import { ILinkMap, IMetaMap, IResourceIdentifier, IResourceIdentifierMap, IResourceObject } from './types'
import { difference } from './utils'

export abstract class Model <F> {
  public type: string
  public id?: string
  public fields: F

  protected constructor (v: IResourceIdentifier | IResourceObject | string, id?: string, fields?: F) {
    if (typeof v === 'string') {
      if (!id) {
        throw ErrIDRequired
      }
      if (fields == null) {
        throw ErrFieldsRequired
      }
      this.type = v
      this.id = id
      this.fields = fields
    } else {
      this.type = v.type
      if (_.has(v, 'attributes')) {
        this.fields = (v as any).attributes
      } else if (fields != null) {
        this.fields = fields
      } else {
        throw ErrFieldsRequired
      }
    }
  }

  public abstract get relationships (): IResourceIdentifierMap
  public abstract get links (): ILinkMap
  public abstract get meta (): IMetaMap

  public update (updater: (f: F) => F): _.Dictionary<any> {
    const before = _.cloneDeep(this.fields)
    this.fields = updater(this.fields)
    return difference(this.fields, before)
  }
}
