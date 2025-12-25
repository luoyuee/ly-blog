import { ref, onUnmounted, type Ref } from "vue";

export interface PhysicsScrollOptions {
  /** 基础摩擦力系数 */
  friction?: number;
  /** 最大速度限制 */
  maxVelocity?: number;
  /** 速度因子 */
  speedFactor?: number;
  /** 最小速度阈值，低于此值停止动画 */
  minVelocity?: number;
  /** 滚动方向 */
  direction?: "horizontal" | "vertical";
  /** 是否启用边界弹性效果 */
  enableBounce?: boolean;
}

export interface PhysicsScrollState {
  /** 当前速度 */
  velocity: number;
  /** 是否正在动画中 */
  isAnimating: boolean;
  /** 当前摩擦力系数 */
  currentFriction: number;
}

/**
 * 物理滚动Hook
 * 提供接近原生滚动体验的物理模拟滚动效果
 */
export function usePhysicsScroll(
  containerRef: Ref<HTMLElement | null>,
  options: PhysicsScrollOptions = {}
) {
  const {
    friction = 0.92,
    maxVelocity = 100,
    speedFactor = 0.8,
    minVelocity = 0.1,
    direction = "horizontal",
    enableBounce = false
  } = options;

  // 物理滚动状态
  const state = ref<PhysicsScrollState>({
    velocity: 0,
    isAnimating: false,
    currentFriction: friction
  });

  let lastScrollTime = 0;
  let animationId: number | null = null;

  /**
   * 核心物理滚动函数
   */
  const physicsScroll = () => {
    if (!containerRef.value) return;

    if (Math.abs(state.value.velocity) > minVelocity) {
      // 应用动态摩擦力 - 速度越快摩擦力越小
      const dynamicFriction = friction - (Math.abs(state.value.velocity) / 100) * 0.1;
      state.value.currentFriction = Math.max(0.8, dynamicFriction);
      state.value.velocity *= state.value.currentFriction;

      const container = containerRef.value;

      if (direction === "horizontal") {
        // 水平滚动
        const currentScrollLeft = container.scrollLeft;
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        const newScrollLeft = currentScrollLeft + state.value.velocity;

        // 边界处理
        if (enableBounce) {
          // 带弹性效果的边界处理
          if (newScrollLeft < 0) {
            container.scrollLeft = 0;
            state.value.velocity *= -0.3; // 反弹效果
          } else if (newScrollLeft > maxScrollLeft) {
            container.scrollLeft = maxScrollLeft;
            state.value.velocity *= -0.3; // 反弹效果
          } else {
            container.scrollLeft = newScrollLeft;
          }
        } else {
          // 无弹性效果的边界处理
          if (newScrollLeft < 0) {
            container.scrollLeft = 0;
            state.value.velocity = 0;
          } else if (newScrollLeft > maxScrollLeft) {
            container.scrollLeft = maxScrollLeft;
            state.value.velocity = 0;
          } else {
            container.scrollLeft = newScrollLeft;
          }
        }
      } else {
        // 垂直滚动
        const currentScrollTop = container.scrollTop;
        const maxScrollTop = container.scrollHeight - container.clientHeight;
        const newScrollTop = currentScrollTop + state.value.velocity;

        // 边界处理
        if (enableBounce) {
          // 带弹性效果的边界处理
          if (newScrollTop < 0) {
            container.scrollTop = 0;
            state.value.velocity *= -0.3; // 反弹效果
          } else if (newScrollTop > maxScrollTop) {
            container.scrollTop = maxScrollTop;
            state.value.velocity *= -0.3; // 反弹效果
          } else {
            container.scrollTop = newScrollTop;
          }
        } else {
          // 无弹性效果的边界处理
          if (newScrollTop < 0) {
            container.scrollTop = 0;
            state.value.velocity = 0;
          } else if (newScrollTop > maxScrollTop) {
            container.scrollTop = maxScrollTop;
            state.value.velocity = 0;
          } else {
            container.scrollTop = newScrollTop;
          }
        }
      }

      animationId = requestAnimationFrame(physicsScroll);
    } else {
      // 滚动停止
      stopAnimation();
    }
  };

  /**
   * 停止动画
   */
  const stopAnimation = () => {
    state.value.velocity = 0;
    state.value.isAnimating = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  };

  /**
   * 开始物理滚动
   * @param initialVelocity 初始速度
   */
  const startPhysicsScroll = (initialVelocity: number) => {
    // 限制最大速度
    state.value.velocity = Math.max(Math.min(initialVelocity, maxVelocity), -maxVelocity);

    if (!state.value.isAnimating && Math.abs(state.value.velocity) > minVelocity) {
      state.value.isAnimating = true;
      animationId = requestAnimationFrame(physicsScroll);
    }
  };

  /**
   * 处理滚轮事件
   */
  const handleWheel = (e: WheelEvent) => {
    if (!containerRef.value) return;

    e.preventDefault();
    e.stopPropagation();

    // 计算时间差
    const now = performance.now();
    const timeDiff = now - lastScrollTime;
    lastScrollTime = now;

    // 计算速度 - 基于时间差调整
    const timeSpeedFactor = Math.min(1, 16 / timeDiff);
    const deltaValue = direction === "horizontal" ? e.deltaY : e.deltaY;
    const newVelocity = state.value.velocity + deltaValue * timeSpeedFactor * speedFactor;

    startPhysicsScroll(newVelocity);
  };

  /**
   * 处理触摸事件
   */
  let touchStartPos = 0;
  let touchStartScroll = 0;
  let touchStartTime = 0;
  let lastTouchPos = 0;
  let lastTouchTime = 0;

  const handleTouchStart = (e: TouchEvent) => {
    if (!containerRef.value) return;

    stopAnimation();

    const now = performance.now();
    touchStartTime = now;
    lastTouchTime = now;

    if (direction === "horizontal") {
      touchStartPos = e.touches[0]!.clientX;
      lastTouchPos = touchStartPos;
      touchStartScroll = containerRef.value.scrollLeft;
    } else {
      touchStartPos = e.touches[0]!.clientY;
      lastTouchPos = touchStartPos;
      touchStartScroll = containerRef.value.scrollTop;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!containerRef.value) return;

    e.preventDefault();

    const now = performance.now();
    const currentPos = direction === "horizontal" ? e.touches[0]!.clientX : e.touches[0]!.clientY;
    const diff = touchStartPos - currentPos;

    // 更新最后的触摸位置和时间
    lastTouchPos = currentPos;
    lastTouchTime = now;

    if (direction === "horizontal") {
      containerRef.value.scrollLeft = touchStartScroll + diff;
    } else {
      containerRef.value.scrollTop = touchStartScroll + diff;
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const now = performance.now();
    const touchEndPos =
      direction === "horizontal" ? e.changedTouches[0]!.clientX : e.changedTouches[0]!.clientY;

    // 计算最近一段时间的平均速度，而不是整个滑动过程的平均速度
    const recentTimeDiff = now - lastTouchTime;
    const recentDistance = lastTouchPos - touchEndPos;

    // 如果最近的时间差太小，使用整个滑动过程的数据
    const timeDiff = recentTimeDiff > 50 ? recentTimeDiff : now - touchStartTime;
    const distance = recentTimeDiff > 50 ? recentDistance : touchStartPos - touchEndPos;

    // 基于时间计算速度 (像素/毫秒)
    let velocity = 0;
    if (timeDiff > 0) {
      velocity = (distance / timeDiff) * 16; // 转换为每帧的速度 (假设60fps)
    }

    // 应用速度缩放因子，使滚动更自然
    velocity *= 0.8;

    // 设置最小速度阈值，避免微小滑动产生滚动
    const minTouchVelocity = 0.5;
    if (Math.abs(velocity) > minTouchVelocity) {
      startPhysicsScroll(velocity);
    }
  };

  /**
   * 绑定事件监听器
   */
  const bindEvents = () => {
    if (!containerRef.value) return;

    const container = containerRef.value;
    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, {
      passive: false
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: false });
  };

  /**
   * 解绑事件监听器
   */
  const unbindEvents = () => {
    if (!containerRef.value) return;

    const container = containerRef.value;
    container.removeEventListener("wheel", handleWheel);
    container.removeEventListener("touchstart", handleTouchStart);
    container.removeEventListener("touchmove", handleTouchMove);
    container.removeEventListener("touchend", handleTouchEnd);
  };

  // 组件卸载时清理
  onUnmounted(() => {
    stopAnimation();
    unbindEvents();
  });

  return {
    /** 物理滚动状态 */
    state,
    /** 开始物理滚动 */
    startPhysicsScroll,
    /** 停止动画 */
    stopAnimation,
    /** 绑定事件监听器 */
    bindEvents,
    /** 解绑事件监听器 */
    unbindEvents,
    /** 处理滚轮事件 */
    handleWheel,
    /** 处理触摸开始事件 */
    handleTouchStart,
    /** 处理触摸移动事件 */
    handleTouchMove,
    /** 处理触摸结束事件 */
    handleTouchEnd
  };
}

export default usePhysicsScroll;
