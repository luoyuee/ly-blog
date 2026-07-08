import { cloneDeep, isEqual, isPlainObject } from "es-toolkit";
import { shallowRef, computed, reactive, toRaw } from "vue";

/** 字段变更信息 */
type FieldChange<T> = { old: T; new: T };

/** 字段变更记录 */
type FieldChanges<T extends object> = Partial<Record<keyof T, FieldChange<T[keyof T]>>>;

/** 比较结果 */
type CompareResult<T extends object> = {
  update: FieldChanges<T>;
  delete: FieldChanges<T>;
  create: FieldChanges<T>;
  unchanged: FieldChanges<T>;
};

/** 嵌套路径变更记录 */
type NestedFieldChanges = Record<string, { old: unknown; new: unknown }>;

/** 嵌套路径比较结果 */
type NestedCompareResult = {
  update: NestedFieldChanges;
  delete: NestedFieldChanges;
  create: NestedFieldChanges;
  unchanged: NestedFieldChanges;
};

/**
 * 表单数据管理 Hook
 * - 支持表单数据的响应式管理
 * - 支持重置单个/多个字段
 * - 支持追踪字段变更
 */
export function useForm<T extends object>(initial: T) {
  // 初始值快照，用于重置和变更对比，使用 shallowRef 避免深层响应式
  const _initial = shallowRef<T>(cloneDeep(initial));

  // 表单数据，保持同一个 reactive 引用，内部通过 replaceFormData 做顶层干净替换
  const formData = reactive(cloneDeep(_initial.value)) as T;

  const formDataKeys = () => {
    return Reflect.ownKeys(toRaw(formData)) as (keyof T)[];
  };

  const replaceFormData = (data: T) => {
    const next = cloneDeep(data);

    formDataKeys().forEach((key) => {
      if (!(key in next)) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete formData[key];
      }
    });

    Object.assign(formData, next);
  };

  /** 重置整个表单为初始值 */
  const resetForm = () => {
    replaceFormData(_initial.value);
  };

  /** 重置单个字段为初始值 */
  const resetField = (key: keyof T) => {
    formData[key] = cloneDeep(_initial.value[key]);
  };

  /** 重置多个字段为初始值，不传 keys 则重置全部 */
  const resetFields = (keys?: (keyof T)[]) => {
    const targetKeys = keys || (Object.keys(_initial.value) as (keyof T)[]);
    targetKeys.forEach((key) => {
      formData[key] = cloneDeep(_initial.value[key]);
    });
  };

  /** 设置整个表单数据 */
  const setForm = (data: T) => {
    replaceFormData(data);
  };

  /** 设置单个字段值 */
  const setFieldValue = (key: keyof T, value: T[keyof T]) => {
    formData[key] = value;
  };

  /** 获取单个字段值 */
  const getFieldValue = (key: keyof T): T[keyof T] => {
    return formData[key];
  };

  /** 重置初始值，后续 reset 会使用新的初始值 */
  const setInitial = (data: T) => {
    _initial.value = cloneDeep(data);
  };

  /** 创建当前表单数据的快照 */
  const snapshot = (): T => {
    return cloneDeep(toRaw(formData));
  };

  /** 从快照恢复表单数据 */
  const restore = (data: T) => {
    replaceFormData(data);
  };

  /** 判断值是否为空（null/undefined） */
  const isEmpty = (value: unknown): boolean => {
    return value === null || value === undefined;
  };

  /** 比较快照与当前表单数据的差异 */
  const compare = (snapshotData: T): CompareResult<T> => {
    const result: CompareResult<T> = {
      update: {},
      delete: {},
      create: {},
      unchanged: {}
    };

    const keys = Object.keys(snapshotData) as (keyof T)[];

    keys.forEach((key) => {
      const oldVal = snapshotData[key];
      const newVal = formData[key];
      const oldIsEmpty = isEmpty(oldVal);
      const newIsEmpty = isEmpty(newVal);
      const hasDiff = !isEqual(oldVal, newVal);

      if (!oldIsEmpty && newIsEmpty && hasDiff) {
        result.delete[key] = { old: oldVal, new: newVal };
      } else if (!oldIsEmpty && !newIsEmpty && hasDiff) {
        result.update[key] = { old: oldVal, new: newVal };
      } else if (oldIsEmpty && !newIsEmpty && hasDiff) {
        result.create[key] = { old: oldVal, new: newVal };
      } else {
        result.unchanged[key] = { old: oldVal, new: newVal };
      }
    });

    return result;
  };

  /** 递归比较嵌套对象差异 */
  const compareNested = (snapshotData: T, basePath: string = ""): NestedCompareResult => {
    const result: NestedCompareResult = {
      update: {},
      delete: {},
      create: {},
      unchanged: {}
    };

    const compareValues = (oldVal: unknown, newVal: unknown, path: string) => {
      const oldIsEmpty = isEmpty(oldVal);
      const newIsEmpty = isEmpty(newVal);
      const hasDiff = !isEqual(oldVal, newVal);

      if (!hasDiff) {
        result.unchanged[path] = { old: oldVal, new: newVal };
        return;
      }

      if (!oldIsEmpty && newIsEmpty) {
        result.delete[path] = { old: oldVal, new: newVal };
      } else if (!oldIsEmpty && !newIsEmpty) {
        if (isPlainObject(oldVal) && isPlainObject(newVal)) {
          const oldObj = oldVal as Record<string, unknown>;
          const newObj = newVal as Record<string, unknown>;
          const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
          allKeys.forEach((k) => {
            compareValues(oldObj[k], newObj[k], `${path}.${k}`);
          });
        } else {
          result.update[path] = { old: oldVal, new: newVal };
        }
      } else if (oldIsEmpty && !newIsEmpty) {
        result.create[path] = { old: oldVal, new: newVal };
      }
    };

    const keys = Object.keys(snapshotData) as (keyof T)[];

    keys.forEach((key) => {
      const path = basePath ? `${basePath}.${String(key)}` : String(key);
      compareValues(snapshotData[key], formData[key], path);
    });

    return result;
  };

  /** 获取变更的字段及新旧值 */
  const getChanges = (): FieldChanges<T> => {
    const changes: FieldChanges<T> = {};

    (Object.keys(_initial.value) as (keyof T)[]).forEach((key) => {
      if (!isEqual(formData[key], _initial.value[key])) {
        changes[key] = {
          old: _initial.value[key],
          new: formData[key]
        };
      }
    });

    return changes;
  };

  /** 被修改的字段名列表 */
  const dirtyFields = computed(() => {
    return (Object.keys(_initial.value) as (keyof T)[]).filter(
      (key) => !isEqual(formData[key], _initial.value[key])
    );
  });

  /** 表单是否有修改 */
  const isDirty = computed(() => {
    return dirtyFields.value.length > 0;
  });

  const formState = reactive({
    submitting: false
  });

  return {
    formData,
    formState,
    dirtyFields,
    isDirty,
    resetForm,
    resetField,
    resetFields,
    setForm,
    setFieldValue,
    getFieldValue,
    setInitial,
    getChanges,
    snapshot,
    restore,
    compare,
    compareNested
  };
}

export type { FieldChange, FieldChanges, CompareResult, NestedFieldChanges, NestedCompareResult };

/**
 * 设计说明：这里最终选择了 `reactive + replaceFormData`，属于表单场景下的工程折中。
 *
 * 目标：
 * 1. 调用方继续使用 `formData.xxx`，避免脚本中到处写 `.value.xxx`
 * 2. 仍然支持整包回填、重置、恢复快照等“整体替换”诉求
 * 3. 让 `formData` 尽量表现为正常响应式对象，支持打印、展开、枚举、序列化
 *
 * 为什么不用 `ref<T>` 直接保存表单：
 * - 优点是可以直接整体替换：`formData.value = newData`
 * - 缺点是业务层脚本必须写 `.value.xxx`，和当前项目大量 `formData.xxx` 用法不兼容
 *
 * 为什么不用“ref + Proxy 壳”旧方案：
 * - 旧方案内部整体替换很自然，但对外暴露的 `formData` 不是正常对象
 * - 容易在 `console.log(formData)`、`{ ...formData }`、`Object.keys(formData)`、
 *   `JSON.stringify(formData)` 等场景出现不符合直觉的行为
 * - 本项目已经存在把 `formData` 当普通对象展开/序列化的用法，因此该方案风险更高
 *
 * 为什么这里采用 `replaceFormData`：
 * - `reactive` 不能直接替换根对象引用，因此通过“保持同一个 reactive 对象 + 原地同步字段”实现
 * - 同步时先删除旧 key，再写入新 key，避免仅用 `Object.assign` 造成旧字段残留
 *
 * 这不是绝对完美方案，而是当前表单场景下副作用最小的方案：
 * - 对外 API 保持不变
 * - 对象语义更自然
 * - 支持 reset / setForm / restore 等显式整体替换入口
 *
 * 当前仍需接受的取舍：
 * - 顶层 `formData` 引用保持稳定
 * - 但嵌套对象在整包回填时可能被整体替换，因此不保证深层子对象引用恒定不变
 * - 如果未来业务强依赖深层对象 identity，再考虑升级为递归深同步方案
 */
