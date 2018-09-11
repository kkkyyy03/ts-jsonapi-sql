import _ from 'lodash'
import { ErrDocumentHasError, ErrInvalidJSON } from './errors'
import { Model } from './model'
import {
  IDocumentObject,
  IDocumentOptions,
  ILinkMap,
  IMetaMap,
  IResourceIdentifier,
  IResourceObject,
  isDocumentObject,
  isResourceIdentifierObject,
  isResourceObject
} from './types'

export class Document {
  public data?: IResourceObject[]
  public error?: Error
  public meta?: IMetaMap
  public links?: ILinkMap
  public included?: IResourceObject[]

  constructor (
    v?: IDocumentObject
      | Error
      | null,
    opts?: IDocumentOptions
  ) {
    // Check type
    if (v) {
      if (_.isError(v)) {
        this.error = v
      } else {
        this.fromJSON(v)
        return
      }
    } else {
      this.data = []
    }

    // Optional Data
    if (typeof opts !== 'undefined') {
      this.meta = opts.meta ? opts.meta : this.meta
      this.links = opts.links ? opts.links : this.links
    }

    this.validate()
  }

  public add (...vs: Array<Model<any> | IResourceObject | IResourceIdentifier>) {
    if (!Array.isArray(this.data)) {
      throw ErrDocumentHasError
    }

    let v: Model<any> | IResourceObject | IResourceIdentifier
    for (v of vs) {
      if (v instanceof Model) {
        this.data.push({
          type: v.type,
          id: v.id,
          attributes: v.fields,
          relationships: v.relationships,
          links: v.links,
          meta: v.meta
        })
      } else if (isResourceObject(v)) {
        this.data.push(v)
      } else {
        throw ErrInvalidJSON
      }
    }
  }

  public include (...vs: Array<Model<any> | IResourceObject>) {
    if (typeof this.included === 'undefined') {
      this.included = []
    }

    let v: Model<any> | IResourceObject
    for (v of vs) {
      if (v instanceof Model) {
        this.included.push({
          type: v.type,
          id: v.id,
          attributes: v.fields,
          relationships: v.relationships,
          links: v.links,
          meta: v.meta
        })
      } else if (isResourceObject(v)) {
        this.included.push(v)
      } else {
        throw ErrInvalidJSON
      }
    }
  }

  public serialize (): string {
    const obj: IDocumentObject = {
      jsonapi: {
        version: '1.0'
      },
      data: (
        typeof this.data !== 'undefined' && this.data.length === 1
          ? this.data[0]
          : this.data
      ),
      error: this.error,
      meta: this.meta,
      links: this.links,
      included: this.included
    }

    return JSON.stringify(obj)
  }

  private fromJSON (s: IDocumentObject) {
    if (!isDocumentObject(s)) {
      throw ErrInvalidJSON
    }

    if (typeof s.data !== 'undefined') {
      this.data = _.isArray(s.data)
        ? s.data
        : [ s.data ]
    }

    if (_.isError(s.error)) {
      this.error = s.error
    } else if (_.isString(s.error)) {
      this.error = new Error(s.error)
    }

    this.meta = s.meta
    this.links = s.links
    this.included = s.included

    this.validate()
  }

  private validate () {
    if (
      (this.data == null && this.error == null) ||
      (this.data != null && this.error != null)
    ) {
      throw ErrInvalidJSON
    }

    if (this.data != null) {
      let data = this.data as any
      if (!_.isArray(data)) {
        data = [ data ]
      }

      let d: any
      for (d of data) {
        if (
          !isResourceObject(d) &&
          !isResourceIdentifierObject(d)
        ) {
          throw ErrInvalidJSON
        }
      }

      return
    }

    if (this.error instanceof Error) {
      return
    }

    throw ErrInvalidJSON
  }
}
