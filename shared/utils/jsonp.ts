/**
 * @description 用于解决GET类型请求跨域的jsonp插件
 * @param url 请求接口地址
 * @param query 请求入参
 * @returns Promise<T> jsonp响应数据
 */

/** JSONP查询参数类型 */
type QueryType = Record<string, string | number | boolean>;

/** JSONP回调函数类型 */
type JsonpCallback<T> = (res: T | null) => void;

/** Window扩展，用于存储jsonp回调 */
interface JsonpWindow {
  [key: string]: JsonpCallback<unknown> | undefined;
}

/**
 * 将查询参数对象序列化为URL查询字符串
 * @param query 查询参数对象
 * @returns 序列化后的查询字符串
 */
const serializeQuery = (query: QueryType): string => {
  return Object.entries(query)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
};

/**
 * 发起JSONP跨域请求
 * @param url 请求接口地址
 * @param query 请求入参
 * @returns Promise<T> jsonp响应数据
 */
export default function jsonp<T = unknown>(url: string, query: QueryType = {}): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    // 根据时间戳 + 随机数生成唯一的callback回调名
    const callbackName = `jsonp_${Date.now()}_${Math.random().toString().replace(/\D/g, "")}`;

    // 创建script标签
    const script = document.createElement("script");

    // 拼接callback参数
    const separator = url.includes("?") ? "&" : "?";
    const queryString = serializeQuery(query);
    const fullUrl = `${url}${separator}callback=${callbackName}${queryString ? `&${queryString}` : ""}`;

    // jsonp核心：通过script的跨域特性发出请求
    script.src = fullUrl;

    const jsonpWindow = window as unknown as JsonpWindow;

    // 给window添加回调属性，用于获取jsonp结果
    jsonpWindow[callbackName] = ((res: T | null) => {
      if (res) {
        resolve(res);
      } else {
        reject(new Error("未查询到任何数据"));
      }
      // 清理：删除window下回调属性
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete jsonpWindow[callbackName];
      // 得到结果后移除script标签
      document.body.removeChild(script);
    }) as JsonpCallback<unknown>;

    // 监听script加载错误
    script.addEventListener("error", () => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete jsonpWindow[callbackName];
      document.body.removeChild(script);
      reject(new Error("请求失败！"));
    });

    // 将script标签挂载到DOM
    document.body.appendChild(script);
  });
}
