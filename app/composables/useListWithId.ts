import { cloneDeep, isEqual } from "es-toolkit";
import { reactive } from "vue";

/** 前端临时 ID 的值类型 */
type ListIdValue = string;

/** 为列表项补充指定 ID 字段后的类型 */
type WithListId<T extends object, K extends string> = T & Record<K, ListIdValue>;

/** useListWithId 配置项 */
type UseListWithIdOptions<K extends string> = {
  /** 前端临时 ID 字段名，默认 id；当业务数据已有 id 时建议使用 _clientId */
  idKey?: K;
  /** ID 前缀，用于区分不同业务列表，默认 list_item */
  prefix?: string;
};

/** 列表变更结果，所有数据均已移除前端临时 ID */
type ListChanges<T extends object> = {
  /** 本次新增的数据；新增后又删除的数据不会出现在这里 */
  created: T[];
  /** 后端原始数据中被编辑过的数据；编辑后又删除的数据只会出现在 deleted */
  updated: T[];
  /** 后端原始数据中被删除的数据 */
  deleted: T[];
  /** 当前完整列表数据 */
  current: T[];
};

/**
 * 为无 ID 列表统一补充前端临时 ID。
 *
 * 适用场景：
 * - 后端返回的列表没有唯一 ID，但前端 v-for、删除、编辑、拖拽排序需要稳定 key
 * - 前端临时新增多行数据，提交后端前需要移除前端 ID 字段
 * - 基于初始化快照识别新增、编辑、删除和混合变更
 *
 * 设计说明：
 * - ID 只用于前端交互定位，不作为业务 ID 或后端入参。
 * - 使用内部自增序号生成 ID，避免同一毫秒内重复，也方便调试列表创建顺序。
 * - list 使用 reactive 数组，兼容模板里直接 v-model="item.xxx" 的深层编辑。
 *
 * @example
 * interface SortFieldPayload {
 *   fieldName: string;
 *   ascending: boolean;
 * }
 *
 * const {
 *   list: sortConditions,
 *   setList,
 *   clearList,
 *   resetList,
 *   addItem,
 *   removeItem,
 *   removeAllItems,
 *   getSubmitList,
 *   getChanges,
 *   resetSnapshot
 * } = useListWithId<SortFieldPayload>(remoteList, {
 *   prefix: "sort_condition"
 * });
 *
 * setList(remoteList);
 * addItem({ fieldName: "title", ascending: true });
 * removeItem(sortConditions[0].id);
 * removeAllItems(); // 清空当前列表，但保留快照，原始数据会进入 changes.deleted
 * resetList(); // 放弃当前修改，恢复为初始化快照
 * clearList(); // 清空当前列表和快照，不会产生 deleted 变更
 * const payload = getSubmitList();
 * const changes = getChanges();
 * // changes 结构：
 * // {
 * //   created: 新增后仍保留的数据,
 * //   updated: 原始数据中被编辑且仍保留的数据,
 * //   deleted: 原始数据中被删除的数据,
 * //   current: 当前完整列表数据
 * // }
 * // 规则：新增后又删除不会出现在任何变更里；编辑后又删除只会出现在 deleted。
 * resetSnapshot();
 */
export function useListWithId<T extends object, K extends string = "id">(
  initialList: T[] = [],
  options: UseListWithIdOptions<K> = {}
) {
  const idKey = (options.idKey ?? "id") as K;
  const prefix = options.prefix ?? "list_item";
  // 对外保持明确的泛型数组类型，避免 Vue 对泛型对象做 UnwrapRef 后影响索引访问。
  const list = reactive([]) as WithListId<T, K>[];
  const originalList = reactive([]) as WithListId<T, K>[];
  let seed = 0;

  /** 生成前端临时 ID，格式如 sort_condition_1 */
  const createId = () => {
    seed += 1;
    return `${prefix}_${seed}`;
  };

  /** 为单条业务数据补充前端临时 ID */
  const createItem = (item: T): WithListId<T, K> => {
    return {
      ...item,
      [idKey]: createId()
    } as WithListId<T, K>;
  };

  /** 替换整个列表，通常用于写入后端返回数据 */
  const setList = (dataList: T[]) => {
    const nextList = dataList.map((item) => createItem(item));

    list.splice(0, list.length, ...nextList);
    originalList.splice(0, originalList.length, ...cloneDeep(nextList));
  };

  /** 清空当前列表和原始快照，适合切换业务对象或完全清理状态 */
  const clearList = () => {
    list.splice(0, list.length);
    originalList.splice(0, originalList.length);
  };

  /** 将当前列表恢复为原始快照，适合撤销本次未保存的增删改 */
  const resetList = () => {
    list.splice(0, list.length, ...cloneDeep(originalList));
  };

  /** 将当前列表保存为新的原始快照，通常用于保存成功后重置变更状态 */
  const resetSnapshot = () => {
    originalList.splice(0, originalList.length, ...cloneDeep(list));
  };

  /** 新增单条数据，并自动补充前端临时 ID */
  const addItem = (item: T) => {
    const createdItem = createItem(item);
    list.push(createdItem);
    return createdItem;
  };

  /** 根据前端临时 ID 删除数据 */
  const removeItem = (id: ListIdValue) => {
    const index = list.findIndex((item) => item[idKey] === id);

    if (index > -1) {
      list.splice(index, 1);
    }
  };

  /** 清空当前列表但保留原始快照，原始数据会在 getChanges().deleted 中返回 */
  const removeAllItems = () => {
    list.splice(0, list.length);
  };

  /** 根据前端临时 ID 局部更新业务字段 */
  const updateItem = (id: ListIdValue, patch: Partial<T>) => {
    const target = list.find((item) => item[idKey] === id);

    if (!target) return;

    Object.assign(target, patch);
  };

  /** 根据前端临时 ID 整体替换业务字段，并保留原前端 ID */
  const replaceItem = (id: ListIdValue, item: T) => {
    const index = list.findIndex((currentItem) => currentItem[idKey] === id);

    if (index === -1) return;

    list.splice(index, 1, {
      ...item,
      [idKey]: id
    } as WithListId<T, K>);
  };

  /** 移除单条数据中的前端临时 ID，得到可提交给后端的业务数据 */
  const stripId = (item: WithListId<T, K>): T => {
    const { [idKey]: _id, ...rest } = item;

    return rest as T;
  };

  /** 获取提交列表，自动移除所有前端临时 ID */
  const getSubmitList = () => {
    return list.map((item) => stripId(item));
  };

  /**
   * 获取列表增删改结果，返回数据均已移除前端临时 ID。
   *
   * 返回结构：
   * - created：初始化快照中不存在、当前列表中存在的数据
   * - updated：初始化快照中存在、当前列表中也存在，但业务字段发生变化的数据
   * - deleted：初始化快照中存在、当前列表中不存在的数据
   * - current：当前完整列表数据
   *
   * 归类规则：
   * - 新增后又删除的数据不会出现在任何变更列表中
   * - 新增后又编辑的数据仍归类为 created
   * - 原始数据编辑后又删除，只归类为 deleted
   * - clearList 会同时清空快照，不会产生 deleted
   * - removeAllItems 只清空当前列表，原始快照会全部归类为 deleted
   */
  const getChanges = (): ListChanges<T> => {
    const originalMap = new Map<ListIdValue, WithListId<T, K>>(
      originalList.map((item) => [item[idKey], item])
    );
    const currentMap = new Map<ListIdValue, WithListId<T, K>>(
      list.map((item) => [item[idKey], item])
    );
    const created: T[] = [];
    const updated: T[] = [];
    const deleted: T[] = [];

    list.forEach((item) => {
      const originalItem = originalMap.get(item[idKey]);

      if (!originalItem) {
        created.push(stripId(item));
        return;
      }

      if (!isEqual(stripId(originalItem), stripId(item))) {
        updated.push(stripId(item));
      }
    });

    originalList.forEach((item) => {
      if (!currentMap.has(item[idKey])) {
        deleted.push(stripId(item));
      }
    });

    return {
      created,
      updated,
      deleted,
      current: getSubmitList()
    };
  };

  setList(initialList);

  return {
    list,
    originalList,
    createId,
    createItem,
    setList,
    clearList,
    resetList,
    resetSnapshot,
    addItem,
    removeItem,
    removeAllItems,
    updateItem,
    replaceItem,
    stripId,
    getSubmitList,
    getChanges
  };
}

export type { ListChanges, ListIdValue, WithListId, UseListWithIdOptions };
