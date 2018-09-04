import _ from 'lodash'
import { Model } from './model'
import TypeUtils from './type-utils'
import {
  IDocument,
  IResourceIdentifierMap,
  IResourceIdentifierObject,
  IResourceObject,
  ISerializeOptions
} from './types'

export class Serializer {
  public static serialize<F> (
    models: Model<F> | Array<Model<F>>,
    opts: ISerializeOptions
  ) {
    const result: IDocument = {
      jsonapi: {
        version: '1.0'
      },
      meta: opts.meta,
      links: opts.links
    }
    result.data = _.isArray(models)
      ? this.serializeCollection(models)
      : this.serializeResource(models)
    return JSON.stringify(result)
  }

  public static serializeCollection<F> (models: Array<Model<F>>): IResourceObject[] {
    return models.map((model): IResourceObject => {
      return this.serializeResource(model)
    })
  }

  public static serializeResource<F> (model: Model<F>): IResourceObject {
    return model.pack()
  }

  public static deserialize (s: string): IDocument {
    const d: IDocument = JSON.parse(s)
    if (
      typeof d !== 'object' ||
      (d.data == null && d.error == null)
    ) {
      throw new Error('invalid document')
    }
    return d
  }
}
