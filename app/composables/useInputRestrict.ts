// 通用：禁止输入指定字符
export function useInputRestrict(forbiddenKeys: string[]) {
  return (e: KeyboardEvent) => {
    if (forbiddenKeys.includes(e.key)) {
      e.preventDefault();
    }
  };
}

// 专用：数字输入框（禁止 e E + - .）
export function useNumberInputRestrict() {
  return useInputRestrict(["e", "E", "+", "-", "."]);
}
