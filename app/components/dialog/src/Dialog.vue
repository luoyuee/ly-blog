<script setup lang="ts">
import type { ButtonProps } from "@nuxt/ui";
import type { PropType } from "vue";
import type {
  DialogAction,
  DialogBeforeClose,
  DialogContentRender,
  DialogFooterRender,
  DialogTitleRender,
  DialogResult
} from "./types";
import { BasicModal } from "@/components/basic-modal";
import { h } from "vue";

const open = defineModel("open", { type: Boolean, default: false });

const props = defineProps({
  title: {
    type: String
  },
  titleRender: {
    type: Function as PropType<DialogTitleRender>
  },
  description: {
    type: String
  },
  content: {
    type: Function as PropType<DialogContentRender>
  },
  footer: {
    type: Function as PropType<DialogFooterRender>
  },
  contentClass: {
    type: String,
    default: ""
  },
  bodyClass: {
    type: String,
    default: ""
  },
  beforeClose: {
    type: Function as PropType<DialogBeforeClose>
  },
  submitting: {
    type: Boolean,
    default: false
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
  showFooter: {
    type: Boolean,
    default: true
  },
  closeOnConfirm: {
    type: Boolean,
    default: false
  },
  closeOnCancel: {
    type: Boolean,
    default: true
  },
  confirmButtonText: {
    type: String
  },
  cancelButtonText: {
    type: String
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
  dismissible: {
    type: Boolean,
    default: true
  },
  fullscreen: {
    type: Boolean,
    default: false
  },
  scrollable: {
    type: Boolean,
    default: false
  },
  transition: {
    type: Boolean,
    default: true
  }
});

// 必须使用调用签名语法声明 emits：useOverlay 的 open() 通过条件类型从组件 $emit
// 提取 close 事件的 payload 作为 Promise resolve 类型，而对象/元组语法生成的 $emit
// 交叉类型中 close 不是最后一个重载，TS 条件类型只匹配最后一个签名
//（microsoft/TypeScript#32164），会导致 await dialog.open() 被推断为 never
const emit = defineEmits<{
  (e: "confirm" | "cancel" | "afterLeave"): void;
  (e: "close", result: DialogResult): void;
}>();

let settled = false;

const resolve = (action: DialogAction) => {
  if (settled) return;

  settled = true;
  emit("close", { action });
};

const handleButtonConfirm = () => {
  emit("confirm");

  if (!props.closeOnConfirm) {
    return;
  }

  resolve("confirm");
};

const handleButtonCancel = () => {
  emit("cancel");

  if (!props.closeOnCancel) {
    return;
  }

  resolve("cancel");
};

const handleConfirm = () => {
  resolve("confirm");
};

const handleCancel = () => {
  resolve("cancel");
};

const handleClose = () => {
  resolve("close");
};

const handleAfterLeave = () => {
  emit("afterLeave");
};

const contentActions = {
  confirm: handleConfirm,
  cancel: handleCancel,
  close: handleClose
};

const renderContent = () => {
  return props.content?.(contentActions) ?? h("div");
};

const RenderTitle = () => {
  return props.titleRender?.() ?? h("div");
};

const RenderFooter = () => {
  return props.footer?.(contentActions) ?? h("div");
};
</script>

<template>
  <BasicModal
    v-model:open="open"
    :title="props.titleRender ? undefined : props.title"
    :description="props.description"
    :content="renderContent"
    :content-class="props.contentClass"
    :body-class="props.bodyClass"
    :before-close="props.beforeClose"
    :submitting="props.submitting"
    :show-close-button="props.showCloseButton"
    :show-confirm-button="props.showConfirmButton"
    :show-cancel-button="props.showCancelButton"
    :show-footer="props.showFooter"
    :close-on-confirm="props.closeOnConfirm"
    :close-on-cancel="props.closeOnCancel"
    :confirm-button-text="props.confirmButtonText"
    :cancel-button-text="props.cancelButtonText"
    :confirm-button-props="props.confirmButtonProps"
    :cancel-button-props="props.cancelButtonProps"
    :overlay="props.overlay"
    :dismissible="props.dismissible"
    :fullscreen="props.fullscreen"
    :scrollable="props.scrollable"
    :transition="props.transition"
    @confirm="handleButtonConfirm"
    @cancel="handleButtonCancel"
    @close="handleClose"
    @after-leave="handleAfterLeave"
  >
    <template v-if="$slots.title || props.titleRender" #title>
      <slot v-if="$slots.title" name="title"></slot>
      <RenderTitle v-else />
    </template>

    <template v-if="$slots.footer || props.footer" #footer>
      <slot v-if="$slots.footer" name="footer"></slot>
      <RenderFooter v-else />
    </template>
  </BasicModal>
</template>
