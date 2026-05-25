/**
 * 将文本写入系统剪贴板。
 * @param text - 需要复制的文本内容
 */
export const writeClipboardText = async (text: string): Promise<void> => {
  if (!import.meta.client || typeof navigator === "undefined" || !navigator.clipboard) {
    throw new Error("当前环境不支持剪贴板复制");
  }

  await navigator.clipboard.writeText(text);
};
