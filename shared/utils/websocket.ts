/** WebSocket配置选项 */
interface SocketOptions {
  /** WebSocket连接地址 */
  url: string;
  /** 重连间隔时间（毫秒），默认3000 */
  retryInterval?: number;
  /** 最大重连次数，默认3 */
  maxRetries?: number;
  /** 是否自动解析JSON消息，默认false */
  parseJson?: boolean;
  /** 是否立即连接，默认false */
  immediate?: boolean;
}

/** WebSocket消息回调函数类型 */
type MessageCallback<T = unknown> = (data: T) => void;

/** WebSocket实例返回的接口 */
interface SocketInstance<T = unknown> {
  /** 监听消息 */
  onMessage: (callback: MessageCallback<T>) => void;
  /** 监听重连全部失败 */
  onReconnectFailed: (callback?: () => void) => void;
  /** 连接WebSocket */
  connect: () => void;
  /** 关闭连接 */
  close: () => void;
  /** 发送消息 */
  send: (msg: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
  /** 销毁实例，清理所有资源 */
  destroy: () => void;
}

/**
 * WebSocket封装，支持自动重连
 * @param options WebSocket配置选项
 * @returns Socket实例
 */
export const useSocket = <T = unknown>(options: SocketOptions): SocketInstance<T> => {
  const retryInterval = options.retryInterval ?? 3000;
  const maxRetries = options.maxRetries ?? 3;

  let ws: WebSocket | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let retries = 0;
  let listenRetry = false;
  let reconnectFailedCallback: (() => void) | undefined;
  let messageCallback: MessageCallback<T> | undefined;

  /** 清理重连定时器 */
  const clearRetryTimer = (): void => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  /** 绑定WebSocket事件处理器 */
  const bindEvents = (): void => {
    if (!ws) return;

    ws.onopen = () => {
      // 连接成功，重置重连计数
      retries = 0;
    };

    ws.onmessage = (event: MessageEvent) => {
      if (!messageCallback) return;
      try {
        const data = options.parseJson ? JSON.parse(event.data) : event;
        messageCallback(data as T);
      } catch {
        // JSON解析失败时，返回原始事件数据
        messageCallback(event as unknown as T);
      }
    };

    ws.onerror = () => {
      // 连接异常，触发重连
      if (listenRetry) {
        retries += 1;
        if (retries > maxRetries && reconnectFailedCallback) {
          reconnectFailedCallback();
          return;
        }
      }
      timer = setTimeout(() => {
        connect();
      }, retryInterval);
    };

    ws.onclose = (event: CloseEvent) => {
      // 非主动关闭时自动重连
      if (event.code !== 1000) {
        ws?.onerror?.(new Event("error") as Event);
      }
    };
  };

  /** 创建连接 */
  const connect = (): void => {
    clearRetryTimer();
    if (ws) {
      ws.onclose = null;
      ws.onerror = null;
      ws.onmessage = null;
      ws.onopen = null;
      ws.close();
    }
    ws = new WebSocket(options.url);
    bindEvents();
  };

  /** 监听消息 */
  const onMessage = (callback: MessageCallback<T>): void => {
    messageCallback = callback;
  };

  /** 关闭连接（不销毁实例，可重新connect） */
  const close = (): void => {
    clearRetryTimer();
    if (ws) {
      ws.close(1000, "主动关闭");
      ws = null;
    }
  };

  /** 发送消息 */
  const send = (msg: string | ArrayBufferLike | Blob | ArrayBufferView): void => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  };

  /** 监听重连全部失败 */
  const onReconnectFailed = (callback?: () => void): void => {
    listenRetry = true;
    reconnectFailedCallback = callback;
  };

  /** 销毁实例，清理所有资源 */
  const destroy = (): void => {
    close();
    messageCallback = undefined;
    reconnectFailedCallback = undefined;
  };

  // 根据immediate参数决定是否立即连接
  if (options.immediate) {
    connect();
  }

  return {
    onMessage,
    onReconnectFailed,
    connect,
    close,
    send,
    destroy
  };
};
