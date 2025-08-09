import DbSearcher, { QueryType } from "czdb";
import { existsSync } from "fs";

const IPV4_DB_PATH = "./assets/cz88_public_v4.czdb";
const IPV6_DB_PATH = "./assets/cz88_public_v4.czdb";
const KEY = "hgOaQEfF168MCAaakksTFg==";

let searcherV4: DbSearcher | null = null;
let searcherV6: DbSearcher | null = null;

/**
 * 使用IP地址获取
 */
export function useIPLocation() {
  if (searcherV4 === null) {
    if (!existsSync(IPV4_DB_PATH)) {
      throw "IPv4 地址库不存在";
    }
    searcherV4 = new DbSearcher(IPV4_DB_PATH, QueryType.MEMORY, KEY);
  }

  if (searcherV6 === null) {
    if (!existsSync(IPV6_DB_PATH)) {
      throw "IPv4 地址库不存在";
    }
    searcherV6 = new DbSearcher(IPV6_DB_PATH, QueryType.MEMORY, KEY);
  }

  const re =
    /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;

  const getIPLocation = (ip: string): string | null => {
    let region: string | null = null;

    if (re.test(ip)) {
      if (searcherV4 === null) {
        throw "IPv4 地址库未初始化";
      }
      region = searcherV4.search(ip);
    } else {
      if (searcherV6 === null) {
        throw "IPv4 地址库未初始化";
      }
      region = searcherV6.search(ip);
    }

    if (region) {
      return region.replace("\t", "|");
    }

    return null;
  };

  return {
    getIPLocation,
    searcherV4,
    searcherV6,
  };
}
