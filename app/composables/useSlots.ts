import type { ComputedRef, Reactive, VNode } from "vue";
import { computed, reactive, useSlots } from "vue";

type SlotsExistResult<T extends string | string[]> = T extends string
  ? ComputedRef<boolean>
  : Reactive<Record<string, ComputedRef<boolean>>>;

/**
 * 组合式函数
 * 监听给定名称或名称数组的插槽是否存在，支持监听单个插槽或一组插槽的存在
 *
 * @param slotsName - 插槽的名称或名称数组，默认为 'default'
 * @returns 如果是单个插槽名称，则返回一个计算属性，表示该插槽是否存在
 *          如果是插槽名称数组，则返回一个 reactive 对象，其中的每个属性对应该插槽是否存在
 */
export function useSlotsExist<T extends string | string[] = "default">(
  slotsName: T
): SlotsExistResult<T> {
  const slots = useSlots(); // 获取当前组件的所有插槽
  // 检查特定名称的插槽是否存在且不为空
  const checkSlotsExist = (slotName: string): boolean => {
    const slotsContent = slots[slotName]?.();
    const checkExist = (slotContent: VNode) => {
      if (slotContent.type === Comment) {
        return false;
      }
      if (Array.isArray(slotContent.children) && !slotContent.children.length) {
        return false;
      }
      if (slotContent.type !== Text) {
        return true;
      }
      if (typeof slotContent.children === "string") {
        return slotContent.children.trim() !== "";
      }
    };
    if (slotsContent && slotsContent?.length) {
      const result = slotsContent.some((slotContent: VNode) => {
        return checkExist(slotContent);
      });
      return result;
    }
    return false;
  };
  if (Array.isArray(slotsName)) {
    const slotsExist = reactive<Record<string, ComputedRef<boolean>>>({});
    slotsName.forEach((slotName: string) => {
      const exist = computed(() => checkSlotsExist(slotName));
      slotsExist[slotName] = exist; // 将一个 ref 赋值给一个 reactive 属性时，该 ref 会自动解包
    });
    return slotsExist as SlotsExistResult<T>;
  } else {
    return computed(() => checkSlotsExist(slotsName)) as SlotsExistResult<T>;
  }
}
