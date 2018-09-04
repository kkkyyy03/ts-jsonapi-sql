import _ from 'lodash'
import { IResourceObject } from './types'

export default {
  isResourceObject: (v: any): v is IResourceObject => {
    // noinspection PointlessBooleanExpressionJS
    return (
      true
      && _.has(v, 'type') && _.isString(v.type)
      && _.has(v, 'id') && _.isString(v.id)
    )
  }
}
