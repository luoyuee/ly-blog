/**
 * 全局定时任务管理器
 * ==========================================================================
 *
 * 基于 `croner` + `mitt` 的全局定时任务管理方案，用于在 SPA 中集中管理
 * 定时任务，通过事件总线解耦任务触发与业务逻辑，并依据监听器数量自动启停
 * 定时器，避免内存泄漏与无效轮询。
 *
 * --------------------------------------------------------------------------
 * 核心能力
 * --------------------------------------------------------------------------
 * - 全局单例管理：所有任务统一创建、暂停、销毁
 * - 事件驱动：任务到点后通过 mitt 广播事件，组件订阅事件响应
 * - 引用计数：监听器为 0 时自动暂停 Cron，>0 时自动恢复
 * - 生命周期安全：Cron 回调不直接持有组件引用，避免闭包泄漏
 * - 兜底清理：`stopTask` 时会清理事件总线残留监听，防止"幽灵回调"
 *
 * --------------------------------------------------------------------------
 * 公开 API
 * --------------------------------------------------------------------------
 * - `createTask(eventName, cronExpr, options?)`：创建/更新任务，默认暂停
 *   等待首个监听者注册时恢复
 * - `pauseTask(eventName)`：暂停调度，保留 Cron 实例，可 `resumeTask` 恢复
 * - `resumeTask(eventName)`：恢复一个被暂停的任务
 * - `stopTask(eventName)`：仅销毁 Cron 实例，保留监听器（便于后续平滑重建）
 * - `removeTask(eventName)`：彻底销毁任务 + 清空监听器 + 清零计数
 * - `on(eventName, handler)`：注册监听器，返回取消函数
 * - `off(eventName, handler)`：取消监听器
 * - `listenerCount(eventName)`：当前监听器数量
 * - `getAllTasks()`：获取所有任务的运行快照（调试用）
 * - `getEmitter()`：获取底层 mitt 实例（仅高级场景）
 *
 * --------------------------------------------------------------------------
 * 生命周期 API 语义梯度
 * --------------------------------------------------------------------------
 * | 方法         | Cron 实例     | 监听器  | 是否可恢复              |
 * | ------------ | ------------ | ------- | ---------------------- |
 * | `pauseTask`  | 保留（暂停）   | 保留    | `resumeTask`            |
 * | `resumeTask` | 保留（运行）   | 保留    | —                       |
 * | `stopTask`   | 销毁          | 保留    | 需 `createTask`         |
 * | `removeTask` | 销毁          | 清空    | 需重新订阅 + `createTask` |
 *
 * --------------------------------------------------------------------------
 * 推荐用法
 * --------------------------------------------------------------------------
 * 业务侧**不要直接调用** `timerManager`，应通过组合式函数
 * `@/composables/useTimerEvent` 使用，组件卸载时会自动清理任务与监听。
 *
 * ```ts
 * import { useTimerEvent } from "@/composables/useTimerEvent";
 * import { buildDailyCronExpr } from "@/utils/timer-manager";
 *
 * const handleAutoBackup = (payload) => {
 *   console.log("自动备份触发", payload.timestamp);
 * };
 *
 * const { createTask, removeTask, stopTask } = useTimerEvent(
 *   "auto-backup",
 *   handleAutoBackup
 * );
 *
 * // 启动：每天 08:30 触发
 * createTask(buildDailyCronExpr(8, 30)!);
 *
 * // 暂时停止（保留订阅，后续可直接再 createTask 恢复）
 * stopTask();
 *
 * // 彻底停止（销毁任务并取消订阅）
 * removeTask();
 * ```
 *
 * 若确需直接使用底层 API：
 *
 * ```ts
 * import { timerManager } from "@/utils/timer-manager";
 *
 * timerManager.createTask("heartbeat", "*\/30 * * * * *");
 * const unsubscribe = timerManager.on("heartbeat", (payload) => {
 *   console.log(payload.timestamp);
 * });
 *
 * // 业务结束时务必调用，否则 mitt 会持续持有 handler 引用造成泄漏
 * unsubscribe();
 * timerManager.removeTask("heartbeat");
 * ```
 *
 * --------------------------------------------------------------------------
 * 注意事项
 * --------------------------------------------------------------------------
 * - Croner 的 `stop()` 不可逆，停止后无法 `resume`，需重新 `createTask`
 * - 回调内若执行耗时操作，业务侧应自行做防抖/节流
 * - 直接通过 `getEmitter()` 注册的监听器**不会**进入引用计数，使用需谨慎
 */

import type { TimerEventHandler, TimerEventPayload } from "./event-bus";
import type { CronOptions } from "croner";
import { createLogger } from "@/utils/logger";
import { emitter } from "./event-bus";
import { Cron } from "croner";

const logger = createLogger("TimerManager");

/**
 * 任务状态快照，便于调试或可视化展示。
 */
export interface TimerTaskInfo {
  /** 事件名称 */
  eventName: string;
  /** 是否处于暂停状态 */
  paused: boolean;
  /** 当前监听器数量 */
  listenerCount: number;
  /** 原始 Cron 表达式 */
  cronExpr: string;
}

// 存储所有任务的映射：eventName -> Cron 实例
const taskMap = new Map<string, Cron>();
// 存储任务原始表达式，用于调试输出
const taskExprMap = new Map<string, string>();
// 存储每个事件的监听器计数：eventName -> count
const listenerCountMap = new Map<string, number>();

const getListenerCount = (eventName: string): number => {
  return listenerCountMap.get(eventName) || 0;
};

const setListenerCount = (eventName: string, count: number): void => {
  if (count <= 0) {
    listenerCountMap.delete(eventName);
  } else {
    listenerCountMap.set(eventName, count);
  }
};

/**
 * 判断 Croner 任务是否处于暂停状态。
 *
 * Croner 没有直接暴露 `paused` 字段，因此通过 `isRunning()` 反向推断：
 * 任务未停止且当前不在运行 schedule，即视为暂停。
 */
const isJobPaused = (job: Cron): boolean => {
  return !job.isStopped() && !job.isRunning();
};

/**
 * 创建或更新一个定时任务。
 *
 * 如果同名任务已存在，会先停止旧任务再创建新任务。
 * 任务创建后默认处于暂停状态，等待首个监听者注册时再恢复。
 */
const createTask = (
  eventName: string,
  cronExpr: string,
  options: CronOptions = {}
): void => {
  // 仅清理旧 Cron 实例，保留监听器与引用计数，便于平滑替换表达式
  disposeJob(eventName);

  const job = new Cron(cronExpr, options, () => {
    // 仅在存在监听者时才广播，避免无效触发
    if (getListenerCount(eventName) > 0) {
      try {
        const payload: TimerEventPayload = {
          eventName,
          timestamp: Date.now()
        };
        emitter.emit(eventName, payload);
      } catch (error) {
        logger.error(`任务回调执行异常: ${eventName}`, error);
      }
    }
  });

  taskMap.set(eventName, job);
  taskExprMap.set(eventName, cronExpr);

  // 根据当前监听计数决定运行状态：无监听者保持暂停
  if (getListenerCount(eventName) === 0) {
    job.pause();
  }

  logger.info(`创建任务: ${eventName} (${cronExpr})`);
};

/**
 * 内部辅助：仅停止并移除 Cron 实例，不动事件总线与计数。
 */
const disposeJob = (eventName: string): void => {
  const job = taskMap.get(eventName);
  if (!job) return;

  job.stop();
  taskMap.delete(eventName);
  taskExprMap.delete(eventName);
};

/**
 * 暂停指定任务的 Cron 调度，保留 Cron 实例与事件监听。
 *
 * 与 `stopTask` 的区别：`pauseTask` 仅暂停 Croner 内部调度，
 * 后续可通过 `resumeTask` 直接恢复，无需重新 `createTask`。
 *
 * @returns 是否成功暂停（任务不存在或本就已暂停时返回 false）
 */
const pauseTask = (eventName: string): boolean => {
  const job = taskMap.get(eventName);
  if (!job || job.isStopped() || isJobPaused(job)) return false;

  const ok = job.pause();
  if (ok) {
    logger.info(`暂停任务: ${eventName}`);
  }
  return ok;
};

/**
 * 恢复一个被暂停的定时任务。
 *
 * @returns 是否成功恢复（任务不存在或本就在运行时返回 false）
 */
const resumeTask = (eventName: string): boolean => {
  const job = taskMap.get(eventName);
  if (!job || job.isStopped() || !isJobPaused(job)) return false;

  const ok = job.resume();
  if (ok) {
    logger.info(`恢复任务: ${eventName}`);
  }
  return ok;
};

/**
 * 停止指定任务的 Cron 调度，但保留事件总线上的监听器与引用计数。
 *
 * 适用于业务侧只想暂停/取消调度，但希望日后重新 `createTask`
 * 时无需让组件重新订阅的场景（例如用户清空了定时时间）。
 */
const stopTask = (eventName: string): void => {
  if (!taskMap.has(eventName)) return;

  disposeJob(eventName);
  logger.info(`停止任务（保留监听）: ${eventName}`);
};

/**
 * 注册事件监听器，并自动维护引用计数与任务启停。
 *
 * @returns 取消监听的函数
 */
const on = (eventName: string, handler: TimerEventHandler): (() => void) => {
  const prevCount = getListenerCount(eventName);
  setListenerCount(eventName, prevCount + 1);

  if (prevCount === 0) {
    const job = taskMap.get(eventName);
    if (job) {
      if (isJobPaused(job)) {
        job.resume();
        logger.info(`恢复任务: ${eventName}`);
      }
    } else {
      logger.warn(`任务 "${eventName}" 未创建，请先调用 createTask`);
    }
  }

  emitter.on(eventName, handler);

  return () => {
    off(eventName, handler);
  };
};

/**
 * 取消事件监听器，引用计数归零时自动暂停任务。
 */
const off = (eventName: string, handler: TimerEventHandler): void => {
  emitter.off(eventName, handler);

  const count = getListenerCount(eventName);
  if (count <= 0) {
    logger.warn(`监听器计数异常: ${eventName}`);
    return;
  }

  const newCount = count - 1;
  setListenerCount(eventName, newCount);

  if (newCount === 0) {
    const job = taskMap.get(eventName);
    if (job && !isJobPaused(job) && !job.isStopped()) {
      job.pause();
      logger.info(`暂停任务: ${eventName}`);
    }
  }
};

/**
 * 彻底销毁一个定时任务。
 *
 * 同时会清理事件总线上残留的监听器与引用计数，
 * 避免业务侧忘记 `off` 时造成的内存泄漏与“幽灵回调”。
 *
 * 注意：Croner 的 `stop()` 是不可逆的，销毁后无法 `resume`。
 */
const removeTask = (eventName: string): void => {
  if (!taskMap.has(eventName)) return;

  disposeJob(eventName);

  // 兜底清理：移除事件总线上所有监听器，并清零引用计数
  const leakedCount = getListenerCount(eventName);
  if (leakedCount > 0) {
    logger.warn(
      `任务销毁时仍存在 ${leakedCount} 个未清理的监听器，已强制清理: ${eventName}`
    );
  }
  emitter.all.delete(eventName);
  listenerCountMap.delete(eventName);

  logger.info(`销毁任务: ${eventName}`);
};

/**
 * 获取某个事件当前的监听器数量。
 */
const listenerCount = (eventName: string): number => {
  return getListenerCount(eventName);
};

/**
 * 获取全部任务的快照信息，便于调试。
 */
const getAllTasks = (): TimerTaskInfo[] => {
  const result: TimerTaskInfo[] = [];
  for (const [eventName, job] of taskMap.entries()) {
    result.push({
      eventName,
      paused: isJobPaused(job),
      listenerCount: getListenerCount(eventName),
      cronExpr: taskExprMap.get(eventName) || ""
    });
  }
  return result;
};

/**
 * 全局定时任务管理器。
 *
 * 基于 Croner + mitt，采用引用计数实现监听器为 0 时自动暂停任务的能力，
 * 避免在 SPA 中由于组件忘记清理定时器而造成的资源泄漏。
 */
export const timerManager = {
  createTask,
  pauseTask,
  resumeTask,
  stopTask,
  removeTask,
  on,
  off,
  listenerCount,
  getAllTasks,
  /** 获取底层事件总线，仅供高级场景使用 */
  getEmitter: () => emitter
};

export type { TimerEventHandler, TimerEventPayload };
