// 浏览器 Web API 特性支持检测

// 当前浏览器是否支持 File System Access API
export const isSupportFileSystemAccess = (): boolean =>
  typeof window !== "undefined" &&
  typeof (window as unknown as { showDirectoryPicker?: unknown })
    .showDirectoryPicker === "function";
