import DbSearcher, { QueryType } from "czdb";
import { existsSync } from "fs";
import config from "@@/server/config";

const IPV4_DB_PATH = config.DATABASE_IPV4_PATH;

const IPV6_DB_PATH = config.DATABASE_IPV6_PATH;

const CZDB_KEY = config.CZDB_KEY;

let searcherV4: DbSearcher | null = null;
let searcherV6: DbSearcher | null = null;

/**
 * 使用IP地址获取地理位置
 */
export function useIPLocation() {
  if (!CZDB_KEY) {
    throw new Error("CZDB_KEY 未配置");
  }

  if (searcherV4 === null) {
    if (!existsSync(IPV4_DB_PATH)) {
      throw new Error(`IPv4 地址库不存在: ${IPV4_DB_PATH}`);
    }
    searcherV4 = new DbSearcher(IPV4_DB_PATH, QueryType.MEMORY, CZDB_KEY);
  }

  if (searcherV6 === null) {
    if (!existsSync(IPV6_DB_PATH)) {
      throw new Error(`IPv6 地址库不存在: ${IPV6_DB_PATH}`);
    }
    searcherV6 = new DbSearcher(IPV6_DB_PATH, QueryType.MEMORY, CZDB_KEY);
  }

  const re = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;

  const getIPLocation = (ip: string): string | null => {
    let region: string | null = null;

    if (re.test(ip)) {
      if (searcherV4 === null) {
        throw new Error("IPv4 地址库未初始化");
      }
      region = searcherV4.search(ip);
    } else {
      if (searcherV6 === null) {
        throw new Error("IPv6 地址库未初始化");
      }
      region = searcherV6.search(ip);
    }

    if (region) {
      return region.replace("\t", " - ");
    }

    return null;
  };

  return {
    getIPLocation,
    searcherV4,
    searcherV6
  };
}
