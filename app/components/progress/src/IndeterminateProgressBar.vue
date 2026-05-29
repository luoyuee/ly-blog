<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import type { FinishAnimationTiming, IndeterminateProgressBarStatus } from "./types";

/**
 * 结束动画默认时序。
 */
const DEFAULT_FINISH_ANIMATION_TIMING: Required<FinishAnimationTiming> = {
  fillDuration: 450,
  holdDuration: 1000,
  leaveDuration: 350
};

const props = defineProps({
  /**
   * 是否处于进行中状态。
   */
  loading: {
    type: Boolean,
    default: false
  },
  /**
   * 进度条高度，单位 px。
   */
  height: {
    type: Number,
    default: 2
  },
  /**
   * 进行中阶段的主颜色。
   */
  color: {
    type: String,
    default: "var(--ui-primary)"
  },
  /**
   * 是否开启结束动画。
   *
   * - false: 保持基础的进入/退出过渡
   * - true: 结束时显示独立 finish block，补满、停顿，再收缩淡出
   */
  enableFinishAnimation: {
    type: Boolean,
    default: false
  },
  /**
   * 结束动画阶段的状态。
   *
   * 注意：该状态仅影响“结束阶段”的颜色，
   * 进行中阶段始终使用 `color`。
   */
  status: {
    type: String as () => IndeterminateProgressBarStatus,
    default: "success"
  },
  /**
   * 成功结束时的颜色。
   */
  successColor: {
    type: String,
    default: "#22c55e"
  },
  /**
   * 警告结束时的颜色。
   */
  warningColor: {
    type: String,
    default: "#f59e0b"
  },
  /**
   * 错误结束时的颜色。
   */
  errorColor: {
    type: String,
    default: "#ef4444"
  },
  /**
   * 结束动画时序配置。
   *
   * 当 loading 从 true 切到 false 且启用结束动画时：
   * 1. running indicator 按普通 fade 退场
   * 2. 独立 finish block 从左到右补满到 100%
   * 3. 保持满宽一段时间，让用户感知最终状态
   * 4. 再执行向上收缩并淡出的退场动画
   *
   * 三个字段全部可选，未传时使用默认值。
   */
  finishAnimationTiming: {
    type: Object as () => FinishAnimationTiming,
    default: () => ({})
  }
});

/**
 * 最终生效的结束动画时序。
 *
 * 调用方可以只覆盖其中一部分字段，其余字段仍回退到默认值。
 */
const finishAnimationTiming = computed<Required<FinishAnimationTiming>>(() => {
  return {
    fillDuration:
      props.finishAnimationTiming.fillDuration ?? DEFAULT_FINISH_ANIMATION_TIMING.fillDuration,
    holdDuration:
      props.finishAnimationTiming.holdDuration ?? DEFAULT_FINISH_ANIMATION_TIMING.holdDuration,
    leaveDuration:
      props.finishAnimationTiming.leaveDuration ?? DEFAULT_FINISH_ANIMATION_TIMING.leaveDuration
  };
});

/**
 * 是否渲染轨道节点。
 *
 * 轨道本身只是零高度锚点，但在以下场景仍需保留：
 * - loading 为 true，running indicator 需要显示
 * - finish block 还在补满 / 停顿 / 退场
 */
const shouldRender = ref(props.loading);

/**
 * 是否显示进行中的指示条。
 *
 * running indicator 只负责不确定进度动画本身，
 * 在 loading 关闭后只执行常规 fade，不再承担补满到 100% 的职责。
 */
const showRunningIndicator = ref(props.loading);

/**
 * 是否显示结束动画块。
 *
 * 该块与 running indicator 独立存在，始终从左侧起步，
 * 从而避免把一个正处于中途位置的条体硬切到满宽时产生跳变。
 */
const showFinishBlock = ref(false);

/**
 * finish block 是否已经进入“满宽”状态。
 *
 * - false: 宽度保持 0，等待下一帧开始补满
 * - true: 宽度过渡到 100%
 */
const isFinishBlockFilled = ref(false);

/**
 * finish block 是否进入“收缩淡出”阶段。
 */
const isFinishBlockLeaving = ref(false);

/**
 * 结束动画相关的计时器。
 *
 * 使用精确的浏览器定时器类型，便于在快速切换 loading 时安全清理：
 * - finishFillTimer: 等待下一帧，触发从 0 到 100% 的宽度过渡
 * - finishHoldTimer: 满宽后的停留计时
 * - finishLeaveTimer: 退场动画结束后的卸载计时
 */
let finishFillTimer: ReturnType<typeof window.setTimeout> | null = null;
let finishHoldTimer: ReturnType<typeof window.setTimeout> | null = null;
let finishLeaveTimer: ReturnType<typeof window.setTimeout> | null = null;

/**
 * 清理结束动画的全部计时器。
 *
 * 组件被快速重复触发时，必须先清掉旧计时器，
 * 否则旧回调可能在新的 loading 周期中错误触发，造成状态穿透。
 */
const clearFinishTimers = () => {
  if (finishFillTimer !== null) {
    window.clearTimeout(finishFillTimer);
    finishFillTimer = null;
  }

  if (finishHoldTimer !== null) {
    window.clearTimeout(finishHoldTimer);
    finishHoldTimer = null;
  }

  if (finishLeaveTimer !== null) {
    window.clearTimeout(finishLeaveTimer);
    finishLeaveTimer = null;
  }
};

/**
 * 重置 finish block 的全部内部状态。
 *
 * 在重新进入 loading、禁用结束动画，或组件真正卸载前，
 * 都需要还原 finish block 的可见性与阶段位。
 */
const resetFinishState = () => {
  clearFinishTimers();
  showFinishBlock.value = false;
  isFinishBlockFilled.value = false;
  isFinishBlockLeaving.value = false;
};

/**
 * 根据结束状态返回对应颜色。
 */
const getStatusColor = () => {
  if (props.status === "warning") {
    return props.warningColor;
  }

  if (props.status === "error") {
    return props.errorColor;
  }

  return props.successColor;
};

/**
 * 轨道样式。
 *
 * 目前只暴露高度配置，保持 API 简洁。
 */
const trackStyle = computed(() => {
  return {
    height: `${props.height}px`
  };
});

/**
 * 进行中指示条样式。
 *
 * running indicator 永远只使用 `color`，
 * 不再接入 status 颜色，职责保持单一。
 */
const runningIndicatorStyle = computed(() => {
  return {
    backgroundColor: props.color
  };
});

/**
 * finish block 样式。
 *
 * 结束状态颜色只作用于 finish block，
 * 从视觉上清楚区分“进行中”和“已结束结果态”。
 */
const finishBlockStyle = computed(() => {
  return {
    backgroundColor: getStatusColor()
  };
});

/**
 * finish block 的阶段类名。
 *
 * 通过不同修饰类控制三个阶段：
 * - idle: 初始宽度 0，等待触发补满
 * - filled: 已补满到 100%，进入停留阶段
 * - leaving: 满宽状态向上收缩并淡出
 */
const finishBlockClassName = computed(() => {
  return {
    "progress-bar__finish--filled": isFinishBlockFilled.value,
    "progress-bar__finish--leaving": isFinishBlockLeaving.value
  };
});

/**
 * 启动独立的结束动画块。
 *
 * 流程：
 * 1. 立即渲染 finish block，但宽度先保持 0
 * 2. 下一帧切到满宽，触发从左到右补满
 * 3. 满宽后停留 `finishHoldDuration`
 * 4. 最后向上收缩并淡出，再卸载整个轨道
 */
const startFinishAnimation = () => {
  shouldRender.value = true;
  resetFinishState();
  showFinishBlock.value = true;

  finishFillTimer = setTimeout(() => {
    isFinishBlockFilled.value = true;
    finishFillTimer = null;

    finishHoldTimer = setTimeout(() => {
      isFinishBlockLeaving.value = true;
      finishHoldTimer = null;

      finishLeaveTimer = setTimeout(() => {
        resetFinishState();
        shouldRender.value = false;
        finishLeaveTimer = null;
      }, finishAnimationTiming.value.leaveDuration);
    }, finishAnimationTiming.value.fillDuration + finishAnimationTiming.value.holdDuration);
  }, 0);
};

/**
 * 监听 loading 状态切换，驱动运行层与 finish 层。
 *
 * 规则：
 * - false -> true: 立即显示 running indicator，并清掉旧的 finish 流程
 * - true -> false 且未启用结束动画: running indicator 正常 fade 退出
 * - true -> false 且启用结束动画: running indicator fade 退出，同时独立 finish block 接管
 */
watch(
  () => props.loading,
  (newVal) => {
    if (newVal) {
      resetFinishState();
      shouldRender.value = true;
      showRunningIndicator.value = true;
      return;
    }

    showRunningIndicator.value = false;

    if (!shouldRender.value) {
      return;
    }

    if (!props.enableFinishAnimation) {
      resetFinishState();
      return;
    }

    startFinishAnimation();
  },
  {
    immediate: true
  }
);

/**
 * running indicator 的退场过渡结束后触发。
 *
 * - 若 finish block 不存在，说明本次只是普通关闭，可直接卸载轨道
 * - 若 finish block 已接管，则轨道继续保留，直到 finish block 完整退场
 */
const handleRunningAfterLeave = () => {
  if (props.loading || showFinishBlock.value) {
    return;
  }

  shouldRender.value = false;
};

/**
 * 组件卸载时清理全部计时器，避免异步回调落到已销毁实例上。
 */
onBeforeUnmount(() => {
  clearFinishTimers();
});
</script>
<template>
  <div class="progress-bar" aria-hidden="true">
    <div v-if="shouldRender" :style="trackStyle" class="progress-bar__track">
      <Transition name="progress-bar__fade" @after-leave="handleRunningAfterLeave">
        <div
          v-if="showRunningIndicator"
          class="progress-bar__indicator progress-bar__indicator--running"
          :style="runningIndicatorStyle"
        ></div>
      </Transition>

      <div
        v-if="showFinishBlock"
        class="progress-bar__finish"
        :class="finishBlockClassName"
        :style="finishBlockStyle"
      ></div>
    </div>
  </div>
</template>
<style scoped lang="scss">
/*
 * 进度条使用完整的 BEM 结构，避免缩写过短导致语义不直观：
 * - .progress-bar
 * - .progress-bar__track
 * - .progress-bar__indicator
 * - .progress-bar__finish
 */
.progress-bar {
  position: relative;
  height: 0;

  /*
   * 使用零高度锚点承载浮动轨道，避免进度条出现/消失时影响周围布局。
   */
  &__track {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 1;
  }

  /*
   * 进行中的指示条本体。
   *
   * 该层只负责不确定进度动画，不再承担 finish handoff。
   */
  &__indicator {
    position: absolute;
    inset: 0 auto 0 0;
    width: 40%;
    border-radius: inherit;
    opacity: 1;

    &--running {
      animation: progress-bar-running 1.5s ease-in-out infinite;
    }
  }

  /*
   * 结束动画块。
   *
   * 它从 0 宽开始，独立完成补满、停留、向上收缩和淡出，
   * 从而避免把正在中途跑动的 indicator 直接切成满宽带来的视觉跳变。
   */
  &__finish {
    position: absolute;
    inset: 0 auto 0 0;
    width: 0;
    border-radius: inherit;
    opacity: 1;
    transform-origin: top center;
    transition:
      width 0.45s ease,
      transform 0.35s ease,
      opacity 0.35s ease,
      background-color 0.2s ease;

    &--filled {
      width: 100%;
    }

    &--leaving {
      width: 100%;
      opacity: 0;
      transform: scaleY(0);
    }
  }
}

/* running indicator 的基础进入/退出透明度过渡。 */
.progress-bar__fade-enter-active,
.progress-bar__fade-leave-active {
  transition: opacity 0.35s ease-out;
}

.progress-bar__fade-enter-from,
.progress-bar__fade-leave-to {
  opacity: 0;
}

/* 不确定进度条的持续跑动动画。 */
@keyframes progress-bar-running {
  0% {
    transform: translateX(-120%);
  }

  100% {
    transform: translateX(320%);
  }
}
</style>
