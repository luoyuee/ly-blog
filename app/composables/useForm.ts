import { cloneDeep, isEqual, isPlainObject } from "es-toolkit";
import { ref, shallowRef, computed, reactive } from "vue";

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

  // 表单数据，使用 ref 保证深层响应式
  const _form = ref<T>(cloneDeep(_initial.value));

  /** 重置整个表单为初始值 */
  const resetForm = () => {
    _form.value = cloneDeep(_initial.value);
  };

  /** 重置单个字段为初始值 */
  const resetField = (key: keyof T) => {
    _form.value[key] = cloneDeep(_initial.value[key]);
  };

  /** 重置多个字段为初始值，不传 keys 则重置全部 */
  const resetFields = (keys?: (keyof T)[]) => {
    const targetKeys = keys || (Object.keys(_initial.value) as (keyof T)[]);
    targetKeys.forEach((key) => {
      _form.value[key] = cloneDeep(_initial.value[key]);
    });
  };

  /** 设置整个表单数据 */
  const setForm = (data: T) => {
    _form.value = cloneDeep(data);
  };

  /** 设置单个字段值 */
  const setFieldValue = (key: keyof T, value: T[keyof T]) => {
    _form.value[key] = value;
  };

  /** 获取单个字段值 */
  const getFieldValue = (key: keyof T): T[keyof T] => {
    return _form.value[key];
  };

  /** 重置初始值，后续 reset 会使用新的初始值 */
  const setInitial = (data: T) => {
    _initial.value = cloneDeep(data);
  };

  /** 创建当前表单数据的快照 */
  const snapshot = (): T => {
    return cloneDeep(_form.value);
  };

  /** 从快照恢复表单数据 */
  const restore = (data: T) => {
    _form.value = cloneDeep(data);
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
      const newVal = _form.value[key];
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
      compareValues(snapshotData[key], _form.value[key], path);
    });

    return result;
  };

  /** 获取变更的字段及新旧值 */
  const getChanges = (): FieldChanges<T> => {
    const changes: FieldChanges<T> = {};

    (Object.keys(_initial.value) as (keyof T)[]).forEach((key) => {
      if (!isEqual(_form.value[key], _initial.value[key])) {
        changes[key] = {
          old: _initial.value[key],
          new: _form.value[key]
        };
      }
    });

    return changes;
  };

  /** 被修改的字段名列表 */
  const dirtyFields = computed(() => {
    return (Object.keys(_initial.value) as (keyof T)[]).filter(
      (key) => !isEqual(_form.value[key], _initial.value[key])
    );
  });

  /** 表单是否有修改 */
  const isDirty = computed(() => {
    return dirtyFields.value.length > 0;
  });

  // 代理对象，让外部可以直接访问属性而无需 .value
  const formData = reactive(
    new Proxy({} as T, {
      get(_, key: string) {
        return _form.value[key as keyof T];
      },
      set(_, key: string, value) {
        (_form.value as Record<string, unknown>)[key] = value;
        return true;
      }
    })
  );

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
