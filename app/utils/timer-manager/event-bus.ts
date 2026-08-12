import mitt, { type Emitter } from "mitt";

/**
 * 定时任务触发时携带的载荷。
 */
export interface TimerEventPayload {
  /** 事件名称 */
  eventName: string;
  /** 触发时的时间戳（毫秒） */
  timestamp: number;
}

/**
 * 定时任务事件总线的事件映射。
 *
 * 使用通配键类型，让任意 `eventName` 都能携带统一的 payload。
 */
export type TimerEvents = Record<string, TimerEventPayload>;

/**
 * 模块内共享的 mitt 事件总线实例。
 */
export const emitter: Emitter<TimerEvents> = mitt<TimerEvents>();

/**
 * 定时任务事件处理函数类型。
 */
export type TimerEventHandler = (payload: TimerEventPayload) => void;
