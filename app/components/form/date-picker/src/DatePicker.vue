<script setup lang="ts">
import { VueDatePicker } from "@vuepic/vue-datepicker";
import {zhCN} from "date-fns/locale";
import "@vuepic/vue-datepicker/dist/main.css";
import dayjs from "dayjs";

/**
 * DatePicker 组件属性接口
 */
interface Props {
  /** 是否为范围选择模式 */
  range?: boolean;
  /** 显示文本的格式化字符串，使用 dayjs 格式 */
  format?: string;
  /** 双向绑定值的格式，支持 dayjs 格式、timestamp 格式，不传则为 Date 对象 */
  valueFormat?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否显示此刻按钮，range模式下强制隐藏 */
  showNowButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  range: false,
  format: "YYYY-MM-DD HH:mm:ss",
  disabled: false,
  showNowButton: true
});

/**
 * 模型值的类型定义
 */
type ModelValue = Date | Date[] | string | string[] | number | number[] | null;

const modelValue = defineModel<ModelValue>({
  default: null
});

const isOpen = ref(false);

/**
 * 内部使用的日期值，始终为 Date 类型
 */
const internalValue = ref<Date | Date[] | null>();

/**
 * 监听模型值变化，将外部传入的值转换为内部 Date 类型
 */
watch(
  modelValue,
  (newValue) => {
    if (props.disabled) return;

    if (newValue === null || (Array.isArray(newValue) && newValue.length === 0)) {
      internalValue.value = props.range ? [] : null;
      return;
    }

    if (props.range) {
      const values = Array.isArray(newValue) ? newValue : [];
      internalValue.value = values.map((item) => convertToDate(item)) as Date[];
    } else {
      internalValue.value = convertToDate(newValue);
    }
  },
  { immediate: true }
);

/**
 * 将外部值转换为内部 Date 类型
 * @param value - 外部传入的值
 * @returns 转换后的 Date 对象
 */
function convertToDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "number") {
    return new Date(value);
  }

  if (typeof value === "string") {
    // 如果是时间戳字符串
    if (/^\d+$/.test(value)) {
      return new Date(parseInt(value));
    }
    // 如果是日期字符串，使用 dayjs 解析
    const date = dayjs(value, props.valueFormat || undefined);
    return date.isValid() ? date.toDate() : null;
  }

  return null;
}

/**
 * 将内部 Date 类型转换为外部格式
 * @param date - 内部 Date 对象
 * @returns 转换后的外部值
 */
function convertToExternalFormat(date: Date | null): ModelValue {
  if (!date) return null;

  if (!props.valueFormat) {
    return date;
  }

  if (props.valueFormat === "timestamp") {
    return date.getTime();
  }

  return dayjs(date).format(props.valueFormat);
}

/**
 * 检查是否有选中的值
 */
const hasSelected = computed(() => {
  const v = modelValue.value;
  return Array.isArray(v) ? v.length > 0 : !!v;
});

/**
 * 是否显示此刻按钮，range模式下强制隐藏
 */
const showNowButton = computed(() => {
  return props.showNowButton && !props.range;
});

/**
 * 显示文本，使用 format 格式化
 */
const showText = computed(() => {
  const v = modelValue.value;
  if (Array.isArray(v)) {
    return v.length ? v.map((item) => formatDisplayText(item)).join(" ~ ") : "";
  }
  return v ? formatDisplayText(v) : "";
});

/**
 * 内部显示的文本，使用 format 格式化
 */
const internalText = computed(() => {
  const v = internalValue.value;
  if (Array.isArray(v)) {
    return v && v.length ? v.map((item) => dayjs(item).format(props.format)).join(" ~ ") : "";
  }
  return v ? dayjs(v).format(props.format) : "";
});

/**
 * 格式化显示文本
 * @param value - 需要格式化的值
 * @returns 格式化后的文本
 */
function formatDisplayText(value: unknown): string {
  if (!value) return "";

  if (value instanceof Date) {
    return dayjs(value).format(props.format);
  }

  if (typeof value === "number") {
    return dayjs(value).format(props.format);
  }

  if (typeof value === "string") {
    // 如果是时间戳字符串
    if (/^\d+$/.test(value)) {
      return dayjs(parseInt(value)).format(props.format);
    }
    // 如果是日期字符串，先解析再格式化
    const date = dayjs(value, props.valueFormat || undefined);
    return date.isValid() ? date.format(props.format) : value;
  }

  return String(value);
}

/**
 * 应用确认选择
 */
function applyConfirm() {
  if (props.disabled) return;

  if (props.range) {
    const values = Array.isArray(internalValue.value) ? internalValue.value : [];
    modelValue.value = values.map((item) => convertToExternalFormat(item)) as ModelValue;
  } else {
    modelValue.value = convertToExternalFormat(
      internalValue.value instanceof Date ? internalValue.value : null
    );
  }

  isOpen.value = false;
}

/**
 * 设置为当前时间
 */
function setNow() {
  if (props.disabled) return;
  const now = new Date();
  internalValue.value = props.range ? [now, now] : now;
}

/**
 * 清空选择的值
 */
function clearValue() {
  if (props.disabled) return;
  modelValue.value = props.range ? [] : null;
  internalValue.value = props.range ? [] : null;
}

const onClickOutside = (validate: () => boolean, evt: PointerEvent) => {
  // 检查点击的元素或其父级元素是否包含 date-picker class
  const target = evt.target as HTMLElement;
  const hasDatePickerClass = target.closest(".dp-date-picker") !== null;

  // 如果没有找到 date-picker class，则关闭弹窗
  if (!hasDatePickerClass) {
    isOpen.value = false;
  }
};
</script>

<template>
  <UPopover
    v-model:open="isOpen"
    :ui="{
      content: 'dp-date-picker'
    }"
  >
    <UButton
      label="Open"
      color="neutral"
      variant="subtle"
      icon="ep:calendar"
      class="w-full justify-between"
    >
      <div class="flex-1 flex justify-start">
        {{ showText || "请选择时间" }}
      </div>

      <template #trailing>
        <UIcon
          v-if="hasSelected"
          name="lucide:x"
          class="cursor-pointer"
          :class="{ 'opacity-50 cursor-not-allowed': props.disabled }"
          @click.stop="clearValue"
        />
      </template>
    </UButton>

    <template #content>
      <div class="p-1">
        <VueDatePicker
          v-model="internalValue"
          inline
          auto-apply
          enable-seconds
          :day-names="['一', '二', '三', '四', '五', '六', '日']"
          :locale="zhCN"
          :range="props.range"
          :multi-calendars="props.range"
          :config="{
            onClickOutside
          }"
        />

        <div class="flex justify-between p-2">
          <div class="text-xs text-gray-500 flex items-center">
            {{ internalText }}
          </div>
          <div class="flex gap-2">
            <UButton v-if="showNowButton" size="sm" color="neutral" variant="ghost" @click="setNow">
              此刻
            </UButton>
            <UButton size="sm" color="primary" variant="solid" @click="applyConfirm">确定</UButton>
          </div>
        </div>
      </div>
    </template>
  </UPopover>
</template>
<style>
.dp__theme_light,
.dp__theme_dark {
  /* 主色调 - 使用项目的主色 */
  --dp-primary-color: var(--ui-primary);
  --dp-primary-text-color: var(--white);

  /* 背景色 - 使用项目的背景色 */
  --dp-background-color: var(--ui-bg);
  --dp-text-color: var(--text-color-primary);

  /* 悬停状态 */
  --dp-hover-color: var(--hover-bg-color);
  --dp-hover-text-color: var(--text-color-primary);

  /* 边框和禁用状态 */
  --dp-border-color: var(--border-color);
  --dp-border-color-hover: var(--primary);
  --dp-disabled-color: var(--bg-color-tertiary);
  --dp-disabled-color-text: var(--text-color-tertiary);

  /* 图标和辅助色 */
  --dp-icon-color: var(--text-color-tertiary);
  --dp-secondary-color: var(--text-color-tertiary);

  /* 成功和危险色 */
  --dp-success-color: var(--success);
  --dp-danger-color: var(--danger);

  /* 圆角 - 使用项目的圆角变量 */
  --dp-border-radius: 6px;
  --dp-cell-border-radius: 6px;

  /* 字体 */
  --dp-font-family: inherit;
  --dp-font-size: 0.875rem;

  /* 间距 */
  --dp-common-padding: 0.5rem;
  --dp-cell-padding: 0.25rem;

  /* 阴影 - 使用项目的阴影变量 */
  --dp-menu-border-color: var(--border-color);
}

/* 移除默认边框 */
.dp__menu {
  border: unset;
  box-shadow: unset;
}

/* 调整时间选择器宽度 */
.dp--tp-wrap {
  max-width: unset;
}

/* 确保按钮样式一致 */
.dp__action_button {
  font-family: inherit;
  font-size: 0.875rem;
}

/* 单元格悬停效果 */
.dp__cell {
  transition: var(--dp-common-transition, all 0.1s ease-in);
}

.dp__cell:hover {
  background-color: var(--dp-hover-color);
  color: var(--dp-hover-text-color);
}

/* 当前日期高亮 */
.dp__today {
  border: 1px solid var(--dp-primary-color);
}

/* 选中日期样式 */
.dp__active_date {
  background-color: var(--dp-primary-color);
  color: var(--dp-primary-text-color);
}

/* 范围选择样式 */
.dp__range_between {
  background-color: var(--dp-hover-color);
  color: var(--dp-text-color);
}

.dp__overlay_container {
  --dp-scroll-bar-background: unset;
  --dp-scroll-bar-color: rgba(0, 0, 0, 0.4);
  --dp-scroll-bar-background: transparent;
}
</style>
