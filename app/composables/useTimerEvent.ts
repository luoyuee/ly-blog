import type { CronOptions } from "croner";
import type { TimerEventHandler } from "@/utils/timer-manager";
import { timerManager } from "@/utils/timer-manager";
import { onBeforeUnmount } from "vue";

/**
 * 订阅指定事件的全局定时任务，并暴露任务管理方法。
 *
 * - 监听器在调用 `createTask` 时延迟注册，避免任务未创建就空跑
 * - 组件卸载时自动取消订阅并销毁任务，无需手动调用 `stopTask`
 * - 业务侧不应再直接访问 `timerManager`，统一通过本组合式函数返回的方法管理
 */
export const useTimerEvent = (eventName: string, handler: TimerEventHandler) => {
  let unsubscribe: (() => void) | null = null;

  // 注册事件监听（确保只注册一次）
  const ensureSubscribed = () => {
    if (unsubscribe) return;
    unsubscribe = timerManager.on(eventName, handler);
  };

  // 取消事件监听
  const unsubscribeIfNeeded = () => {
    if (!unsubscribe) return;
    unsubscribe();
    unsubscribe = null;
  };

  /**
   * 创建或更新定时任务，同时确保已订阅事件。
   */
  const createTask = (cronExpr: string, options?: CronOptions) => {
    timerManager.createTask(eventName, cronExpr, options);
    ensureSubscribed();
  };

  /**
   * 暂停调度，保留 Cron 实例，可通过 `resumeTask` 直接恢复。
   */
  const pauseTask = () => {
    return timerManager.pauseTask(eventName);
  };

  /**
   * 恢复一个被暂停的任务。
   */
  const resumeTask = () => {
    return timerManager.resumeTask(eventName);
  };

  /**
   * 仅停止 Cron 调度，保留事件监听，便于后续直接 `createTask` 恢复。
   */
  const stopTask = () => {
    timerManager.stopTask(eventName);
  };

  /**
   * 彻底销毁任务并取消事件监听。
   */
  const removeTask = () => {
    unsubscribeIfNeeded();
    timerManager.removeTask(eventName);
  };

  // 组件卸载时彻底清理，避免泄漏
  onBeforeUnmount(() => {
    removeTask();
  });

  return {
    createTask,
    pauseTask,
    resumeTask,
    stopTask,
    removeTask
  };
};
