/**
 * 结束动画支持的终态类型。
 *
 * - success: 成功结束
 * - warning: 警告结束
 * - error: 错误结束
 */
export type IndeterminateProgressBarStatus = "success" | "warning" | "error";

/**
 * 结束动画时序配置。
 */
export type FinishAnimationTiming = {
  /**
   * 补满到 100% 的过渡时长，单位 ms。
   */
  fillDuration?: number;
  /**
   * 补满后的停留时长，单位 ms。
   */
  holdDuration?: number;
  /**
   * 向上收缩并淡出的退场时长，单位 ms。
   */
  leaveDuration?: number;
};
