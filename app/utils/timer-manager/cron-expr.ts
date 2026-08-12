/**
 * 将 string | number 标准化为整数；非整数或解析失败返回 NaN。
 */
const toIntegerOrNaN = (value: string | number): number => {
  if (typeof value === "number") {
    return Number.isInteger(value) ? value : NaN;
  }

  const trimmed = value.trim();
  if (trimmed === "" || !/^-?\d+$/.test(trimmed)) return NaN;

  return Number(trimmed);
};

/**
 * 构建"每天某时某分某秒触发一次"的 croner 6 段表达式。
 *
 * 时分秒支持 string 或 number 两种形式，内部统一标准化为整数后再校验范围。
 *
 * @param hour - 小时（0-23）
 * @param minute - 分钟（0-59），默认 0
 * @param second - 秒（0-59），默认 0
 * @returns 合法的 6 段 cron 表达式，参数非法时返回 null
 */
export const buildDailyCronExpr = (
  hour: string | number,
  minute: string | number = 0,
  second: string | number = 0
): string | null => {
  const h = toIntegerOrNaN(hour);
  const m = toIntegerOrNaN(minute);
  const s = toIntegerOrNaN(second);

  if (h < 0 || h > 23 || Number.isNaN(h)) return null;
  if (m < 0 || m > 59 || Number.isNaN(m)) return null;
  if (s < 0 || s > 59 || Number.isNaN(s)) return null;

  return `${s} ${m} ${h} * * *`;
};
