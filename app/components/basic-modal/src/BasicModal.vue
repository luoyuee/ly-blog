<script setup lang="ts">
import type { BasicModalAction, BasicModalBeforeClose, BasicModalContentRender } from "./types";
import type { ButtonProps } from "@nuxt/ui";
import type { PropType } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// BasicModal 通过 v-model:visible 进行双向绑定使用，内部关闭会同步回写外部 visible。
const visible = defineModel("visible", { type: Boolean, default: false });

const props = defineProps({
  title: {
    type: String
  },
  description: {
    type: String
  },
  content: {
    type: Function as PropType<BasicModalContentRender>
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
    type: Function as PropType<BasicModalBeforeClose>
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
  }
});

const Content = () => {
  if (props.content) {
    return props.content();
  }
};

const emits = defineEmits<{
  confirm: [];
  cancel: [];
  close: [];
  afterLeave: [];
}>();

const handleAfterLeave = () => {
  emits("afterLeave");
};

// 统一执行真正的关闭动作：先关闭弹窗，再按触发来源抛出对应事件。
// 这里不再做 beforeClose 判断，确保所有需要关闭的入口都必须先经过 handleBeforeClose。
const proceedClose = (action: BasicModalAction) => {
  visible.value = false;

  switch (action) {
    case "confirm":
      emits("confirm");
      break;
    case "cancel":
      emits("cancel");
      break;
    case "close":
      emits("close");
      break;
  }
};

// 关闭前置拦截入口，所有会关闭弹窗的操作都通过这里传入 action。
// beforeClose 仅在当前动作需要实际关闭弹窗时触发；业务主动调用 done 后才会继续关闭。
const handleBeforeClose = (action: BasicModalAction) => {
  if (props.beforeClose) {
    props.beforeClose({
      action,
      done: () => {
        proceedClose(action);
      }
    });
    return;
  }

  proceedClose(action);
};

// 默认确定按钮仅触发 confirm 事件；仅当 closeOnConfirm 为 true 时，才进入关闭流程。
const handleConfirm = () => {
  if (!props.closeOnConfirm) {
    emits("confirm");
    return;
  }

  handleBeforeClose("confirm");
};

// 默认取消按钮会关闭弹窗；当 closeOnCancel 为 false 时，仅触发 cancel 事件。
const handleCancel = () => {
  if (!props.closeOnCancel) {
    emits("cancel");
    return;
  }

  handleBeforeClose("cancel");
};

// UModal 的右上角关闭、遮罩点击、Esc 等关闭行为都会表现为 open=false。
// 这些非按钮关闭统一归类为 close，避免绕过 beforeClose。
const handleUpdate = (e: boolean) => {
  if (e === false) {
    handleBeforeClose("close");
  }
};
</script>
<template>
  <UModal
    :open="visible"
    :description="props.description"
    :ui="{
      header: 'p-2 sm:px-4 min-h-12',
      body: `p-2 sm:p-4 slim-scrollbar ${props.bodyClass}`,
      footer: 'justify-end p-2 sm:px-4',
      close: props.showCloseButton ? 'top-2 end-2' : 'hidden',
      content: props.contentClass
    }"
    v-bind="$attrs"
    @update:open="handleUpdate"
    @after:leave="handleAfterLeave"
  >
    <template #title>
      <slot name="title">
        {{ props.title }}
      </slot>
    </template>
    <template #body>
      <slot>
        <Content />
      </slot>
    </template>

    <template #footer v-if="showFooter">
      <slot name="footer">
        <UButton
          v-if="showConfirmButton"
          color="primary"
          v-bind="props.confirmButtonProps"
          :loading="props.submitting"
          @click="handleConfirm"
        >
          {{ props.confirmButtonText ?? t("common.confirm") }}
        </UButton>
        <UButton
          v-if="showCancelButton"
          color="error"
          variant="outline"
          v-bind="props.cancelButtonProps"
          :disabled="props.submitting"
          @click="handleCancel"
        >
          {{ props.cancelButtonText ?? t("common.cancel") }}
        </UButton>
      </slot>
    </template>
  </UModal>
</template>
