import _ from 'lodash'

/**
 * Deep diff between two object, using lodash
 * https://gist.github.com/Yimiprod/7ee176597fef230d1451#gistcomment-2081353
 */
export function difference (obj: _.Dictionary<any>, base: _.Dictionary<any>) {
  return _.transform(obj, (result, value, key) => {
    if (!_.isEqual(value, base[key])) {
      result[key] = _.isObject(value) && _.isObject(base[key]) ? difference(value, base[key]) : value
    }
  })
}