<script setup lang="ts">
import type { MessageBoxAction, MessageBoxResult, MessageBoxType, MessageBoxUI } from "./types";
import type { ButtonProps } from "@nuxt/ui";
import type { PropType } from "vue";
import { computed, watch } from "vue";
import { MessageBoxTheme } from "./theme";
import { twMerge } from "@/utils/tw-merge";

const open = defineModel<boolean>("open", { default: false });

const props = defineProps({
  title: {
    type: String
  },
  message: {
    type: String
  },
  type: {
    type: String as PropType<MessageBoxType>,
    default: "info"
  },
  icon: {
    type: String
  },
  showCloseButton: {
    type: Boolean,
    default: true
  },
  showConfirmButton: {
    type: Boolean,
    default: true
  },
  showCancelButton: {
    type: Boolean,
    default: true
  },
  confirmButtonText: {
    type: String,
    default: "确定"
  },
  cancelButtonText: {
    type: String,
    default: "取消"
  },
  confirmButtonProps: {
    type: Object as PropType<Partial<ButtonProps>>,
    default: () => ({})
  },
  cancelButtonProps: {
    type: Object as PropType<Partial<ButtonProps>>,
    default: () => ({})
  },
  overlay: {
    type: Boolean,
    default: true
  },
  submitting: {
    type: Boolean,
    default: false
  },
  closeOnConfirm: {
    type: Boolean,
    default: true
  },
  closeOnCancel: {
    type: Boolean,
    default: true
  },
  ui: {
    type: Object as PropType<MessageBoxUI>,
    default: () => ({})
  }
});

// 必须使用调用签名语法声明 emits：useOverlay 的 open() 通过条件类型从组件 $emit
// 提取 close 事件的 payload 作为 Promise resolve 类型，而对象/元组语法生成的 $emit
// 交叉类型中 close 不是最后一个重载，TS 条件类型只匹配最后一个签名
//（microsoft/TypeScript#32164），会导致 await modal.open() 被推断为 never
const emit = defineEmits<{
  (e: "confirm" | "cancel" | "afterLeave"): void;
  (e: "close", result: MessageBoxResult): void;
}>();

let settled = false;

const resolve = (action: MessageBoxAction) => {
  if (settled) return;

  settled = true;
  emit("close", { action });
};

const computedIcon = computed(() => {
  if (props.icon) return props.icon;

  switch (props.type) {
    case "primary":
      return "mdi:information-circle-outline";
    case "success":
      return "mdi:check-circle";
    case "error":
      return "mdi:close-circle";
    case "warning":
      return "mdi:warning-circle";
    case "info":
      return "mdi:info-circle";
    case "question":
      return "mdi:question-mark-circle";
    default:
      return undefined;
  }
});

const computedIconColor = computed(() => {
  switch (props.type) {
    case "primary":
      return "text-blue-500";
    case "success":
      return "text-green-500";
    case "error":
      return "text-red-500";
    case "warning":
      return "text-yellow-500";
    case "info":
      return "text-blue-500";
    case "question":
      return "text-gray-500";
    default:
      return undefined;
  }
});

// 合并默认主题与外部 ui 覆盖，模板直接消费 mergedUI.xxx
const mergedUI = computed(() => ({
  // 内容区容器
  content: twMerge(MessageBoxTheme.content, props.ui?.content),
  // 标题
  title: twMerge(MessageBoxTheme.title, props.ui?.title),
  // 关闭按钮：右上角定位
  closeButton: twMerge(MessageBoxTheme.closeButton, props.ui?.closeButton),
  // 主体区域：flex 横向布局，容纳图标 + 消息
  body: twMerge(MessageBoxTheme.body, props.ui?.body),
  // 图标：合并主题色、外部 ui 覆盖、动态类型色
  icon: twMerge(MessageBoxTheme.icon, props.ui?.icon, computedIconColor.value),
  // 消息文案
  message: twMerge(MessageBoxTheme.message, props.ui?.message),
  // 操作按钮区：右对齐，gap-2
  actions: twMerge(MessageBoxTheme.actions, props.ui?.actions)
}));

const handleConfirm = () => {
  emit("confirm");

  if (props.closeOnConfirm) {
    resolve("confirm");
  }
};

const handleCancel = () => {
  emit("cancel");

  if (props.closeOnCancel) {
    resolve("cancel");
  }
};

const handleClose = () => {
  resolve("close");
};

const handleAfterLeave = () => {
  emit("afterLeave");
};

watch(open, (value) => {
  if (!value && !settled) {
    resolve("close");
  }
});
</script>

<template>
  <UModal
    v-model:open="open"
    :overlay="props.overlay"
    :dismissible="!props.submitting"
    @after:leave="handleAfterLeave"
  >
    <template #content>
      <div :class="mergedUI.content">
        <div v-if="props.title" :class="mergedUI.title">
          {{ props.title }}
        </div>
        <UButton
          v-if="props.showCloseButton"
          color="neutral"
          variant="ghost"
          icon="mdi:close"
          :class="mergedUI.closeButton"
          size="sm"
          :disabled="props.submitting"
          @click="handleClose"
        />
        <div :class="mergedUI.body">
          <UIcon v-if="computedIcon" :name="computedIcon" :class="mergedUI.icon" />

          <div v-if="props.message" :class="mergedUI.message">
            {{ props.message }}
          </div>
        </div>

        <div :class="mergedUI.actions">
          <UButton
            v-if="showConfirmButton"
            color="primary"
            :loading="props.submitting"
            :disabled="props.submitting"
            v-bind="props.confirmButtonProps"
            @click="handleConfirm"
          >
            {{ props.confirmButtonText }}
          </UButton>
          <UButton
            v-if="showCancelButton"
            color="neutral"
            variant="outline"
            :disabled="props.submitting"
            v-bind="props.cancelButtonProps"
            @click="handleCancel"
          >
            {{ props.cancelButtonText }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
