/** 判断当前浏览器是否支持指定视频文件格式。 */
export const isBrowserSupportedVideo = (mimeType: string): boolean => {
  if (!mimeType.startsWith("video/") || typeof document === "undefined") {
    return false;
  }

  return document.createElement("video").canPlayType(mimeType) !== "";
};
