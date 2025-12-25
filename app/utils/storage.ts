// Base64 编解码使用浏览器原生 API，实现对 UTF-8 的正确支持

function encodeBase64(str: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function decodeBase64(str: string): string {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}

interface StorageData {
  val: any;
  exp?: number;
}

class LocalStorage {
  prefix: string;
  constructor(prefix: string) {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}-${key}`;
  }

  set(key: string, val: any, exp?: number) {
    const data: StorageData = { val };

    if (exp) data.exp = new Date().getTime() + exp * 1000;

    window.localStorage.setItem(
      this.getKey(key),
      encodeBase64(JSON.stringify(data))
    );
  }

  get<T>(key: string): T | null {
    const str = window.localStorage.getItem(this.getKey(key));
    if (str === null) return null;

    const data: { val: T; exp: number } = JSON.parse(decodeBase64(str));
    const now = new Date().getTime();
    if (data.exp && now > data.exp) {
      this.remove(key);
      return null;
    }

    return data.val;
  }

  remove(key: string) {
    window.localStorage.removeItem(this.getKey(key));
  }

  clear() {
    window.localStorage.clear();
  }
}

export const useLocalStorage = (prefix: string) => new LocalStorage(prefix);

class SessionStorage {
  prefix: string;
  constructor(prefix: string) {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}-${key}`;
  }

  set(key: string, val: any, exp?: number) {
    const data: StorageData = { val };

    if (exp) data.exp = new Date().getTime() + exp * 1000;

    window.sessionStorage.setItem(
      this.getKey(key),
      encodeBase64(JSON.stringify(data))
    );
  }

  get<T>(key: string): T | null {
    const str = window.sessionStorage.getItem(this.getKey(key));
    if (str === null) return null;

    const data: { val: T; exp: number } = JSON.parse(decodeBase64(str));
    const now = new Date().getTime();
    if (data.exp && now > data.exp) {
      this.remove(key);
      return null;
    }

    return data.val;
  }

  remove(key: string) {
    window.sessionStorage.removeItem(this.getKey(key));
  }

  clear() {
    window.sessionStorage.clear();
  }
}

export const useSessionStorage = (prefix: string) => new SessionStorage(prefix);
