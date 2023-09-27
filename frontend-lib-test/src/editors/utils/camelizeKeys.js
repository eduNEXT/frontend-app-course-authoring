import { camelCase } from 'lodash-es';

const camelizeKeys = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(v => camelizeKeys(v));
  }
  if (obj != null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({ ...result, [camelCase(key)]: camelizeKeys(obj[key]) }),
      {},
    );
  }
  return obj;
};
export default camelizeKeys;
