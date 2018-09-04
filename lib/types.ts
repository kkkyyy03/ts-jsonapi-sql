export interface ISerializeOptions {
  meta?: IMetaObject
  links?: ILinkMap
}

export interface IAttributeObject {
  [key: string]: any
}

export interface IMetaObject {
  [key: string]: any
}

export interface ILinkObject {
  href: string
  meta?: IMetaObject
}

export interface ILinkMap {
  [key: string]: string | ILinkObject
}

export interface IResourceIdentifierObject {
  id: string
  type: string
  meta?: IMetaObject
}

export interface IResourceIdentifierMap {
  [key: string]: IResourceIdentifierObject
}

export interface IResourceObject {
  id?: string
  type: string
  attributes?: IAttributeObject
  relationships?: IResourceIdentifierMap
  links?: ILinkMap
  meta?: IMetaObject
}

export interface IDocument {
  jsonapi?: {
    version: string
  },
  data?: IResourceObject | IResourceObject[] | IResourceIdentifierObject | IResourceIdentifierObject[]
  error?: Error
  meta?: IMetaObject
  links?: ILinkMap
  includes?: IResourceIdentifierObject[]
}
