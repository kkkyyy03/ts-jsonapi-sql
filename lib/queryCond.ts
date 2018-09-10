import _ from 'lodash'
import SqlString from 'sqlstring'
import { ErrDuplicatedCond } from './errors'

interface IChild {
  operator: string,
  cond: QueryCond
}

export class QueryCond {
  private key: string
  private value: any = null
  private pattern: string = ''
  private prefix: string[] = []
  private children: IChild[] = []

  public constructor (key: string) {
    this.key = key
  }

  public get not (): QueryCond {
    this.prefix.push('NOT')
    return this
  }

  public is (value: any) {
    return this.set('?? = ?', value)
  }

  public like (value: any) {
    return this.set('?? LIKE ?', value)
  }

  public and (cond: QueryCond): QueryCond {
    return this.addChild('AND', cond)
  }

  public or (cond: QueryCond): QueryCond {
    return this.addChild('OR', cond)
  }

  public build (): string {
    return _.concat(
      this.prefix,
      SqlString.format(this.pattern, [this.key, this.value]),
      ...this.children.map((child) => [
        child.operator,
        child.cond.build()
      ])
    ).join(' ')
  }

  private set (pattern: string, value: any) {
    if (this.pattern) {
      throw ErrDuplicatedCond
    }
    this.pattern = '?? = ?'
    this.value = value
    return this
  }

  private addChild (operator: string, cond: QueryCond): QueryCond {
    this.children.push({
      operator,
      cond
    })
    return this
  }
}
