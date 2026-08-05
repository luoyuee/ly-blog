import Scrollbar from "./src/Scrollbar.vue";

// 暴露方法类型，与原版 Scrollbar 对齐，便于调用方逐步替换时直接复用
export type * from "./src/types";

export { Scrollbar };
export default Scrollbar;
