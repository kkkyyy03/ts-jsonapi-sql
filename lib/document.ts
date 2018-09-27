import _ from 'lodash'
import { ErrDocumentHasError, ErrInvalidJSON } from './errors'
import { Model } from './model'
import {
  filterFlatObject,
  IDocumentObject,
  IDocumentOptions, IFlatObject,
  ILinkMap,
  IMetaMap,
  IResourceIdentifier,
  IResourceObject,
  isDocumentObject, isFlatObject,
  isResourceIdentifierObject,
  isResourceObject
} from './types'

export class Document {
  private _data?: IResourceObject[]
  private _error?: Error
  private _included?: IResourceObject[]
  private _meta?: IMetaMap
  private _links?: ILinkMap

  public get data (): IResourceObject[] | undefined {
    return this._data
  }

  public get error (): Error | undefined {
    return this._error
  }
  public set error (err: Error | undefined) {
    if (err === undefined) {
      this._data = []
      this._error = undefined
      return
    }

    if (Array.isArray(this._data) && this._data.length === 0) {
      this._data = undefined
    }
    this._error = err
  }

  public get included (): IResourceObject[] | undefined {
    return this._included
  }

  public get meta (): IMetaMap | undefined {
    return this._meta
  }

  public get links (): ILinkMap | undefined {
    return this._links
  }

  constructor (
    v?: IDocumentObject
      | Error
      | null,
    opts?: IDocumentOptions
  ) {
    this._data = []

    // Check type
    if (v != null) {
      if (_.isError(v)) {
        this.error = v
      } else {
        this.fromJSON(v)
        return
      }
    }

    // Optional Data
    if (typeof opts !== 'undefined') {
      this._meta = opts.meta ? opts.meta : this._meta
      this._links = opts.links ? opts.links : this._links
    }

    this.validate()
  }

  public add (...vs: Array<Model<any> | IResourceObject | IResourceIdentifier | IFlatObject>) {
    if (!Array.isArray(this._data)) {
      throw ErrDocumentHasError
    }

    let v: Model<any> | IResourceObject | IResourceIdentifier | IFlatObject
    for (v of vs) {
      if (v instanceof Model) {
        this._data.push({
          type: v.type,
          id: v.id,
          attributes: v.fields,
          relationships: v.relationships,
          links: v.links,
          meta: v.meta
        })
      } else if (isResourceObject(v)) {
        this._data.push(v)
      } else if (isFlatObject(v)) {
        this._data.push({
          type: v.type,
          id: v.id,
          attributes: filterFlatObject(v)
        })
      } else {
        throw ErrInvalidJSON
      }
    }
  }

  public include (...vs: Array<Model<any> | IResourceObject>) {
    if (typeof this._included === 'undefined') {
      this._included = []
    }

    let v: Model<any> | IResourceObject
    for (v of vs) {
      if (v instanceof Model) {
        this._included.push({
          type: v.type,
          id: v.id,
          attributes: v.fields,
          relationships: v.relationships,
          links: v.links,
          meta: v.meta
        })
      } else if (isResourceObject(v)) {
        this._included.push(v)
      } else {
        throw ErrInvalidJSON
      }
    }
  }

  public setError (err: Error) {
    this.error = err
  }

  public serialize (): string {
    const obj: IDocumentObject = {
      jsonapi: {
        version: '1.0'
      },
      data: (
        typeof this._data !== 'undefined' && this._data.length === 1
          ? this._data[0]
          : this._data
      ),
      error: (
        typeof this.error !== 'undefined'
          ? this.error.toString()
          : undefined
      ),
      meta: this._meta,
      links: this._links,
      included: this._included
    }

    return JSON.stringify(obj)
  }

  private fromJSON (s: IDocumentObject) {
    if (!isDocumentObject(s)) {
      throw ErrInvalidJSON
    }

    if (typeof s.data !== 'undefined') {
      this._data = _.isArray(s.data)
        ? s.data
        : [ s.data ]
    }

    if (_.isError(s.error)) {
      this.error = s.error
    } else if (_.isString(s.error)) {
      this.error = new Error(s.error)
    }

    this._meta = s.meta
    this._links = s.links
    this._included = s.included

    this.validate()
  }

  private validate () {
    if (
      (this._data == null && this.error == null) ||
      (this._data != null && this.error != null)
    ) {
      throw ErrInvalidJSON
    }

    if (this._data != null) {
      let data = this._data as any
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
