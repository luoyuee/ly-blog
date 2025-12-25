import process from "node:process";

// 设置正确的 import.meta.url 值
globalThis._importMeta_ = {
  url: import.meta.url,
  env: process.env
};
