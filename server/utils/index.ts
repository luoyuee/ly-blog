import { runtimeLogger } from "@@/server/utils/logger";
import crypto from "crypto";
import axios from "axios";

export async function getQQInfo(qq: string): Promise<{ nickname: string; avatar: string }> {
  const result = {
    nickname: "",
    avatar: `https://q1.qlogo.cn/g?b=qq&nk=${qq}&s=100`
  };
  try {
    const response = await axios.get("https://api.oioweb.cn/api/qq/info", {
      params: { qq }
    });
    if (response.data.code === 200) {
      result.nickname = response.data.result.nickname;
    }
  } catch (error) {
    runtimeLogger.error(error);
  }

  return result;
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
