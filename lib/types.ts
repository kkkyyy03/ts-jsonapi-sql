import _ from 'lodash'
import { ErrIDRequired } from './errors'

function must (v: any, path: string, check: (v: any) => boolean): boolean {
  return _.has(v, path) && check(v[path])
}

function opts (v: any, path: string, check: (v: any) => boolean): boolean {
  return _.has(v, path) ? check(v[path]) : true
}

export interface IAttributeMap {
  [key: string]: any
}

export interface IMetaMap {
  [key: string]: any
}

export interface ILinkObject {
  href: string
  meta?: IMetaMap
}

export function isLinkObject (v: any): v is ILinkObject {
  const hasHref = _.has(v, 'href')
  const hasMeta = _.has(v, 'meta')
  return (
    (hasHref && _.isString(v.href)) && // 문자열 href 를 가지고 있어야 함
    (hasMeta ? _.isObject(v.meta) : true) // 메타가 있다면 오브젝트여야 함
  )
}

export interface ILinkMap {
  [key: string]: string | ILinkObject
}

export interface IResourceIdentifier {
  type: string
  id: string
  meta?: IMetaMap
}

export function isResourceIdentifierObject (v: any): v is IResourceIdentifier {
  return (
    must(v, 'type', _.isString) &&
    must(v, 'id', _.isString) &&
    opts(v, 'meta', _.isObject)
  )
}

export interface IResourceIdentifierMap {
  [key: string]: IResourceIdentifier
}

export interface IResourceObject {
  type: string
  id?: string
  attributes?: IAttributeMap
  relationships?: IResourceIdentifierMap
  links?: ILinkMap
  meta?: IMetaMap
}

export function isResourceObject (v: any): v is IResourceObject {
  if (typeof v !== 'object') {
    return false
  }

  const hasType = _.has(v, 'type')
  const hasID = _.has(v, 'id')
  const hasAttr = _.has(v, 'attributes')
  const hasRels = _.has(v, 'relationships')
  const hasLink = _.has(v, 'links')
  const hasMeta = _.has(v, 'meta')
  if (
    !(
      (hasType && _.isString(v.type)) && // 문자열 타입을 가지고 있어야 함
      (hasID ? _.isString(v.id) : true) && // ID를 가지고 있다면, 문자열이여야 함
      (hasAttr ? _.isObject(v.attributes) : true) && // Attributes 객체가 있다면 오브젝트여야 함
      (hasRels ? _.isObject(v.relationships) : true) && // 관계 객체가 있다면 오브젝트여야 함
      (hasLink ? _.isObject(v.links) : true) && // 링크 객체가 있다면 오브젝트여야 함
      (hasMeta ? _.isObject(v.meta) : true) // 메타 객체가 있다면 오브젝트여야 함
    )
  ) {
    return false
  }

  let key: string
  for (key in v) {
    if (!v.hasOwnProperty(key)) {
      continue
    }
    if (
      key === 'type' ||
      key === 'id' ||
      key === 'attributes' ||
      key === 'relationships' ||
      key === 'links' ||
      key === 'meta'
    ) {
      continue
    }
    return false
  }

  return true
}

export interface IDocumentObject {
  jsonapi?: {
    version: string
  },
  data?: IResourceObject | IResourceIdentifier | IResourceObject[] | IResourceIdentifier[],
  error?: Error | string,
  meta?: IMetaMap,
  links?: ILinkMap,
  included?: IResourceObject[]
}

export interface IDocumentOptions {
  meta?: IMetaMap
  links?: ILinkMap
}

export function isData (
  v: any
): v is IResourceObject | IResourceIdentifier | IResourceObject[] | IResourceIdentifier[] {
  if (!_.isArray(v)) {
    v = [ v ]
  }
  let e: IResourceObject | IResourceIdentifier
  for (e of v) {
    if (
      isResourceIdentifierObject(e) ||
      isResourceObject(e)
    ) {
      continue
    }
    return false
  }
  return true
}

export function isDocumentObject (v: any): v is IDocumentObject {
  const hasVer = _.has(v, 'jsonapi.version')
  const hasData = _.has(v, 'data')
  const hasErr = _.has(v, 'error')
  const hasAttr = _.has(v, 'attributes')
  const hasRel = _.has(v, 'relationships')
  const hasLink = _.has(v, 'links')
  const hasMeta = _.has(v, 'meta')
  return (
    (hasVer ? _.isString(v.jsonapi.version) : true) && // 버전이 있다면 문자열이여야 함
    !(hasData && hasErr) && // 데이터와 오류는 같이 있을 수 없음
    (hasData || hasErr) && // 데이터 혹은 오류중 하나는 존재해야 함
    (hasData ? isData(v.data) : true) && // 데이터가 있으면 타입 검사
    (hasErr ? _.isError(v.error) || _.isString(v.error) : true) && // 오류가 있으면 문자열 혹은 Error 객체여야 함
    (hasAttr ? _.isObject(v.attributes) : true) && // 속성 객체가 있다면 오브젝트여야 함
    (hasRel ? _.isObject(v.relationships) : true) && // 관계 객체가 있다면 오브젝트여야 함
    (hasLink ? _.isObject(v.links) : true) && // 링크 객체가 있다면 오브젝트여야 함
    (hasMeta ? _.isObject(v.meta) : true) // 메타 객체가 있다면 오브젝트여야 함
  )
}

export interface IFlatObject {
  id: string,
  type: string,
  [key: string]: any
}

export function isFlatObject (v: any): v is IFlatObject {
  return (
    (_.has(v, 'id') && _.isString(v.id)) ||
    (_.has(v, 'type') && _.isString(v.type))
  )
}

export function filterFlatObject (v: IFlatObject) {
  const result: { [key: string]: any } = {}

  let key: string
  for (key in v) {
    if (!v.hasOwnProperty(key)) {
      continue
    }

    if (
      key === 'id' ||
      key === 'type'
    ) {
      continue
    }

    result[key] = v[key]
  }

  return result
}

export function flatFrom (type: string, v: { [key: string]: any }): IFlatObject {
  // check ID
  if (!_.has(v, 'id') || !_.isString(v.id)) {
    throw ErrIDRequired
  }

  const result = _.cloneDeep(v) as IFlatObject // Incomplete
  result.type = type

  return result
}
