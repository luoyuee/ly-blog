import type { InjectionKey } from "vue";
import { inject, provide } from "vue";

/**
 * 创建组件作用域内的共享上下文。
 *
 * 设计目标：
 * 1. 让一棵组件子树共享同一份实例级状态和方法。
 * 2. 避免把只属于某个组件实例的状态提升成模块单例或全局 Pinia 状态。
 * 3. 统一 provide / inject 的写法，并在未提供上下文时给出明确错误。
 *
 * 作用域说明：
 * - 这里的 scoped 指“组件树作用域”，不是 JavaScript 变量作用域。
 * - createScopedContext 只会创建一对固定的 provide / use 方法，以及对应的 InjectionKey。
 * - 真正的业务状态应当在组件实例内部创建，然后通过 provideContext 提供给后代组件。
 * - 即使多个组件实例共用同一个 InjectionKey，也不会共享状态；后代组件会拿到离自己最近的 provider。
 *
 * 不要这样使用：
 * ```ts
 * // 错误示例：这会把状态变成模块单例
 * export const state = reactive({ count: 0 });
 * ```
 *
 * 推荐这样使用：
 * ```ts
 * // context.ts
 * import { createScopedContext } from "@/composables/createScopedContext";
 *
 * export interface DemoContext {
 *   state: {
 *     count: number;
 *   };
 *   increment: () => void;
 * }
 *
 * export const [provideDemoContext, useDemoContext] =
 *   createScopedContext<DemoContext>("DemoContext");
 * ```
 *
 * ```vue
 * <!-- Root.vue -->
 * <script setup lang="ts">
 * import { reactive } from "vue";
 * import { provideDemoContext } from "./context";
 *
 * const state = reactive({
 *   count: 0
 * });
 *
 * const increment = () => {
 *   state.count += 1;
 * };
 *
 * provideDemoContext({
 *   state,
 *   increment
 * });
 * </script>
 * ```
 *
 * ```vue
 * <!-- Child.vue -->
 * <script setup lang="ts">
 * import { useDemoContext } from "./context";
 *
 * const { state, increment } = useDemoContext();
 * </script>
 * ```
 *
 * 适用场景：
 * - 大型组件内部需要跨层共享状态。
 * - 同一个业务组件会创建多个实例，实例之间不能互相污染。
 * - 希望减少多层 props / emits 透传。
 *
 * 不适用场景：
 * - 应用级全局状态，例如用户信息、权限、全局字典。
 * - 只在单个组件内部使用的局部状态。
 * - 需要跨页面长期共享或持久化的数据。
 *
 * @param name 用于生成 Symbol 和错误提示的上下文名称，建议使用明确的业务名，例如 ArchiveTableContext。
 * @returns [provideContext, useContext]
 * provideContext: 在上层组件中提供上下文。
 * useContext: 在后代组件中消费上下文；若当前组件树中未提供该上下文，会直接抛错。
 */
export const createScopedContext = <T extends object>(name: string) => {
  const contextKey: InjectionKey<T> = Symbol(name);

  /**
   * 在当前组件实例中提供上下文。
   *
   * 通常在容器组件或根组件中调用。这里传入的 context 应当是当前组件实例自己创建的状态和方法，
   * 而不是模块顶层的单例对象。
   *
   * 返回原始 context，便于在 provide 的同时继续在当前组件中使用。
   */
  const provideContext = (context: T): T => {
    provide(contextKey, context);

    return context;
  };

  /**
   * 读取当前组件树中最近的上下文。
   *
   * 查找规则：
   * - 从当前组件开始，沿父组件链向上查找最近一次 provide。
   * - 找到后立即返回，不会继续向更高层查找。
   *
   * 这里故意不提供默认值。若上下文缺失，直接抛错，避免静默失败导致状态来源不清。
   */
  const useContext = (): T => {
    const context = inject(contextKey);

    if (!context) {
      throw new Error(`${name} is not provided`);
    }

    return context;
  };

  return [provideContext, useContext] as const;
};
