import { cloneDeep, isObject } from "lodash-es";
import crypto from "crypto";

import axios from "axios";

export function recursiveDelete(
  object: Record<any, any>,
  deleteValue: any
): Record<any, any> {
  if (!isObject(object)) return object;

  const data = cloneDeep(object);
  for (var key in data) {
    if (data[key] === deleteValue) {
      delete data[key];
    } else if (isObject(data[key])) {
      recursiveDelete(data[key], deleteValue);
    }
  }

  return data;
}

export function toTree<
  T extends { id: number; parent?: number; children?: T[] }
>(data: T[]): T[] {
  const map: Record<number, T> = {};

  data.forEach((item) => {
    map[item.id] = item;
  });

  const tree: T[] = [];

  data.forEach((item) => {
    if (item.parent && map[item.parent]) {
      if (map[item.parent].children) {
        map[item.parent].children!.push(item);
      } else {
        map[item.parent].children = [item];
      }
    } else {
      tree.push(item);
    }
  });

  return tree;
}

export async function getQQInfo(
  qq: string
): Promise<{ nickname: string; avatar: string }> {
  const result = {
    nickname: "",
    avatar: `https://q1.qlogo.cn/g?b=qq&nk=${qq}&s=100`,
  };
  try {
    const response = await axios.get("https://api.oioweb.cn/api/qq/info", {
      params: { qq },
    });
    if (response.data.code === 200) {
      result.nickname = response.data.result.nickname;
    }
  } catch (error) {
    console.error(error);
  }

  return result;
}

export function saveFile(
  data: Blob,
  options?: {
    filename?: string;
  }
) {
  const url = URL.createObjectURL(data);

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const defaultName = `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;

  const a = document.createElement("a");
  a.href = url;
  a.download = options ? options.filename ?? defaultName : defaultName;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const getHash = (buffer: Buffer) => {
  // 创建hash对象
  const hash = crypto.createHash("sha256");
  // 更新hash对象的内容
  hash.update(buffer);
  // 生成hash摘要（十六进制格式）
  const digestHex = hash.digest("hex");
  return digestHex;
};
