/**
 * 将promise转换为[err,data]的格式
 * @param {*} promise
 * @returns [err,data]
 */
export const to = <T>(promise: Promise<T>) => {
  return promise.then((data) => [null, data]).catch((err) => [err, null]);
};
