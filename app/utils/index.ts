export function isQQEmail(email: string): boolean {
  return /^\d+@[Qq]{2}\.[Cc][Oo][Mm]$/.test(email);
}

export async function getQQInfo(qq: string): Promise<{ nickname?: string; avatar?: string }> {
  const result = {
    // nickname: "",
    avatar: `https://q1.qlogo.cn/g?b=qq&nk=${qq}&s=100`
  };

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
  a.download = options ? (options.filename ?? defaultName) : defaultName;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const getHash = async (buffer: ArrayBuffer): Promise<string> => {
  // 使用Web Crypto API创建hash对象
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  // 将ArrayBuffer转换为十六进制字符串
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
};
