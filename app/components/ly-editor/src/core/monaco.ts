import monacoLoader from "@monaco-editor/loader";

/**
 * 初始化 Monaco loader 并返回 Monaco 包。
 */
export const initMonaco = async () => {
  const monacoPackage = await import("monaco-editor");

  monacoLoader.config({ monaco: monacoPackage });

  const monaco = await monacoLoader.init();

  return {
    monaco,
    monacoPackage
  };
};
