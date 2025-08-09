/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

export const isElement = (el: any): el is Element => {
  if (typeof Element === "undefined") return false;
  return el instanceof Element;
};

export const isWindow = (value: any): value is Window => value === window;

export const isUndefined = (val: any): val is undefined => val === undefined;

export const isNull = (val: any): val is null => val === null;

export const isNil = (val: any): val is null | undefined =>
  isNull(val) || isUndefined(val);

export const isBoolean = (val: any): val is boolean => typeof val === "boolean";

export const isSymbol = (value: any): value is symbol => {
  return !!value && value.constructor === Symbol;
};

export const isArray = Array.isArray;

export const isObject = (value: any): value is object => {
  return !!value && value.constructor === Object;
};

/**
 * 检查值是否为原始类型
 *
 * 原始类型: number , string , boolean , symbol, bigint, undefined, null
 *
 * @param {*} value value to check
 * @returns {boolean} result
 */
export const isPrimitive = (value: any): boolean => {
  return (
    value === undefined ||
    value === null ||
    (typeof value !== "object" && typeof value !== "function")
  );
};

export const isFunction = (value: any): value is Function => {
  return !!(value && value.constructor && value.call && value.apply);
};

export const isString = (value: any): value is string => {
  return typeof value === "string" || value instanceof String;
};

export const isNumber = (value: any): value is number => {
  return typeof value === "number" && !isNaN(value);
};

export const isInt = (value: any): value is number => {
  return isNumber(value) && value % 1 === 0;
};

export const isFloat = (value: any): value is number => {
  return isNumber(value) && value % 1 !== 0;
};

export function isBigInt(value: any): value is bigint {
  return typeof value === "bigint";
}

export const isStringNumber = (value: string): boolean => {
  if (!isString(value)) return false;
  if (value === "") return false;
  return !Number.isNaN(Number(value));
};

export const isDate = (value: any): value is Date => {
  return Object.prototype.toString.call(value) === "[object Date]";
};

export const isEmpty = (value: any) => {
  if (value === true || value === false) return true;
  if (value === null || value === undefined) return true;
  if (isNumber(value)) return value === 0;
  if (isDate(value)) return isNaN(value.getTime());
  if (isFunction(value)) return false;
  if (isSymbol(value)) return false;
  const length = (value as any).length;
  if (isNumber(length)) return length === 0;
  const size = (value as any).size;
  if (isNumber(size)) return size === 0;
  const keys = Object.keys(value).length;
  return keys === 0;
};

export const isEqual = <T>(x: T, y: T): boolean => {
  if (Object.is(x, y)) return true;
  if (x instanceof Date && y instanceof Date) {
    return x.getTime() === y.getTime();
  }
  if (x instanceof RegExp && y instanceof RegExp) {
    return x.toString() === y.toString();
  }
  if (
    typeof x !== "object" ||
    x === null ||
    typeof y !== "object" ||
    y === null
  ) {
    return false;
  }
  const keysX = Reflect.ownKeys(x as any as object) as (keyof typeof x)[];
  const keysY = Reflect.ownKeys(y as any as object);
  if (keysX.length !== keysY.length) return false;
  for (let i = 0; i < keysX.length; i++) {
    if (!Reflect.has(y as any as object, keysX[i])) return false;
    if (!isEqual(x[keysX[i]], y[keysX[i]])) return false;
  }
  return true;
};

export const isTagged = (value: unknown, tag: string): boolean => {
  return Object.prototype.toString.call(value) === tag;
};

export const isMap = <K = unknown, V = unknown>(
  value: unknown
): value is Map<K, V> => {
  return isTagged(value, "[object Map]");
};

export const isSet = <T>(value: unknown): value is Set<T> => {
  return isTagged(value, "[object Set]");
};

export const isRegExp = (value: unknown): value is RegExp => {
  return isTagged(value, "[object RegExp]");
};
