/**
 * 生成前端临时唯一 ID。
 *
 * 采用 `时间戳 + 随机串` 的方式，兼顾可读性与低碰撞概率，
 * 适用于列表项 key、前端临时新增数据等不需要严格全局唯一的场景。
 *
 * 注意：该 ID 仅用于前端交互定位，不可作为业务 ID 或后端存储主键，
 * 提交后端前应移除该字段。
 *
 * @param prefix ID 前缀，默认 `tmp`
 * @returns 形如 `tmp_1722758400000_a1b2c3d4` 的字符串
 *
 * @example
 * generateTempId(); // "tmp_1722758400000_a1b2c3d4"
 * generateTempId("condition"); // "condition_1722758400000_a1b2c3d4"
 */
export const generateTempId = (prefix = "tmp"): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 12).padEnd(10, "0")}`;
};
