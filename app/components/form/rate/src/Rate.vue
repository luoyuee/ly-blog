<script setup lang="ts">
/**
 * Rate 评分组件
 * 支持半星、只读、自定义图标、可清空等功能
 */
import type { PropType } from "vue";
import { computed, ref } from "vue";

// 定义双向绑定的评分值，默认为 0
const modelValue = defineModel<number>({ default: 0 });

// 组件属性定义
const props = defineProps({
  // 最大星数
  max: {
    type: Number,
    default: 5
  },
  // 是否允许半星选择
  allowHalf: {
    type: Boolean,
    default: false
  },
  // 是否只读模式（可显示但不可交互）
  readonly: {
    type: Boolean,
    default: false
  },
  // 是否禁用状态
  disabled: {
    type: Boolean,
    default: false
  },
  // 是否显示分数文本
  showScore: {
    type: Boolean,
    default: false
  },
  // 图标尺寸：xs(超小)、sm(小)、md(中)、lg(大)、xl(超大)
  size: {
    type: String as PropType<"xs" | "sm" | "md" | "lg" | "xl">,
    default: "md"
  },
  // 激活状态的颜色（选中星星的颜色）
  color: {
    type: String,
    default: "text-yellow-400"
  },
  // 未激活状态的颜色（未选中星星的颜色）
  voidColor: {
    type: String,
    default: "text-gray-300"
  },
  // 激活状态的图标名称
  icon: {
    type: String,
    default: "mdi:star"
  },
  // 未激活状态的图标名称
  voidIcon: {
    type: String,
    default: "mdi:star-outline"
  },
  // 是否可清空（再次点击相同分数时重置为0）
  clearable: {
    type: Boolean,
    default: false
  }
});

// 鼠标悬停时的临时评分值，用于预览效果
const hoverValue = ref<number | null>(null);

// 尺寸映射表：将尺寸名称映射为 Tailwind CSS 类名
const sizeMap: Record<string, string> = {
  xs: "size-6", // 24px
  sm: "size-7", // 28px
  md: "size-8", // 32px
  lg: "size-9", // 36px
  xl: "size-10" // 40px
};

// 计算当前图标尺寸类名
const iconSize = computed(() => sizeMap[props.size] || sizeMap.md);

// 计算当前显示的评分值（优先显示悬停预览值）
const displayValue = computed(() => {
  // 如果有悬停值，显示悬停值用于预览
  if (hoverValue.value !== null) {
    return hoverValue.value;
  }
  // 否则显示实际绑定的值
  return modelValue.value;
});

// 计算组件是否可交互（非只读且非禁用状态）
const isInteractive = computed(() => !props.readonly && !props.disabled);

/**
 * 处理鼠标移动事件
 * 用于实现悬停预览效果，支持半星选择
 * @param index - 当前星星的索引（从1开始）
 * @param event - 鼠标事件对象
 */
const handleMouseMove = (index: number, event: MouseEvent) => {
  // 如果不可交互，直接返回
  if (!isInteractive.value) return;

  if (props.allowHalf) {
    // 半星模式：根据鼠标位置判断选择左半星还是整星
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const halfWidth = rect.width / 2;
    // 鼠标在左半边显示半星，右半边显示整星
    hoverValue.value = x <= halfWidth ? index - 0.5 : index;
  } else {
    // 非半星模式：直接显示整星
    hoverValue.value = index;
  }
};

/**
 * 处理鼠标离开事件
 * 清除悬停预览状态
 */
const handleMouseLeave = () => {
  hoverValue.value = null;
};

/**
 * 处理点击事件
 * 设置最终的评分值
 * @param index - 当前星星的索引（从1开始）
 * @param event - 鼠标事件对象
 */
const handleClick = (index: number, event: MouseEvent) => {
  // 如果不可交互，直接返回
  if (!isInteractive.value) return;

  let newValue: number;

  if (props.allowHalf) {
    // 半星模式：根据点击位置计算新值
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const halfWidth = rect.width / 2;
    newValue = x <= halfWidth ? index - 0.5 : index;
  } else {
    // 非半星模式：直接使用整星值
    newValue = index;
  }

  // 如果开启可清空且点击的是当前值，则重置为0
  if (props.clearable && modelValue.value === newValue) {
    modelValue.value = 0;
    hoverValue.value = null;
  } else {
    // 否则更新为新值
    modelValue.value = newValue;
  }
};

/**
 * 获取指定索引星星的显示类型
 * @param index - 星星索引（从1开始）
 * @returns "full" - 整星 | "half" - 半星 | "void" - 空星
 */
const getIconType = (index: number): "full" | "half" | "void" => {
  const value = displayValue.value;

  // 如果当前值大于等于索引，显示整星
  if (value >= index) return "full";
  // 如果允许半星且当前值大于等于索引-0.5，显示半星
  if (props.allowHalf && value >= index - 0.5) return "half";
  // 否则显示空星
  return "void";
};

// 格式化显示的分数文本（保留一位小数）
const scoreText = computed(() => modelValue.value.toFixed(1));
</script>

<template>
  <!-- 评分组件容器 -->
  <div
    class="inline-flex items-center gap-1"
    :class="{ 'opacity-50 cursor-not-allowed': disabled }"
    @mouseleave="handleMouseLeave"
  >
    <!-- 循环渲染每个星星 -->
    <div
      v-for="i in max"
      :key="i"
      class="relative cursor-pointer"
      :class="{ 'cursor-default': !isInteractive }"
      @mousemove="handleMouseMove(i, $event)"
      @click="handleClick(i, $event)"
    >
      <!-- 空星状态：显示未激活图标 -->
      <UIcon
        v-if="getIconType(i) === 'void'"
        :name="voidIcon"
        :class="[iconSize, voidColor]"
      />

      <!-- 整星状态：显示激活图标 -->
      <UIcon
        v-else-if="getIconType(i) === 'full'"
        :name="icon"
        :class="[iconSize, color]"
      />

      <!-- 半星状态：通过叠加两个图标实现 -->
      <div v-else class="relative" :class="iconSize">
        <!-- 底层：未激活图标作为背景 -->
        <UIcon
          :name="voidIcon"
          :class="[iconSize, voidColor]"
          class="absolute inset-0"
        />
        <!-- 上层：激活图标，通过 clip-path 裁剪显示左半部分 -->
        <UIcon
          :name="icon"
          :class="[iconSize, color]"
          class="absolute inset-0"
          style="clip-path: inset(0 50% 0 0)"
        />
      </div>
    </div>

    <!-- 分数显示文本 -->
    <span v-if="showScore" class="ml-2 text-sm text-gray-600">
      {{ scoreText }}
    </span>
  </div>
</template>
