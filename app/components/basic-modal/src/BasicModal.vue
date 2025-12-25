<script setup lang="ts">
import type { ButtonProps } from "@nuxt/ui";
import type { PropType, VNode } from "vue";

type DoneFn = () => void;

const visible = defineModel("visible", { type: Boolean, default: false });

const props = defineProps({
  title: {
    type: String
  },
  description: {
    type: String
  },
  content: {
    type: Function as PropType<() => VNode>
  },
  contentClass: {
    type: String
  },
  beforeClose: {
    type: Function as PropType<(done: DoneFn) => void>
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
  confirmButtonText: {
    type: String,
    default: "确认"
  },
  cancelButtonText: {
    type: String,
    default: "取消"
  },
  confirmButtonProps: {
    type: Object as () => Partial<ButtonProps>
  },
  cancelButtonProps: {
    type: Object as () => Partial<ButtonProps>,
    default: () => ({})
  }
});

const Content = () => {
  if (props.content) {
    return props.content();
  }
};

const emits = defineEmits(["close", "confirm", "cancel", "afterLeave"]);

const handleAfterLeave = () => {
  emits("afterLeave");
};

const handleConfirm = () => {
  emits("confirm");
};

const handleCancel = () => {
  if (props.beforeClose) {
    props.beforeClose(() => {
      visible.value = false;
      emits("cancel");
    });
  } else {
    visible.value = false;
    emits("cancel");
  }
};

const handleUpdate = (e: boolean) => {
  if (e === false) {
    if (props.beforeClose) {
      props.beforeClose(() => {
        visible.value = false;
        emits("close");
      });
    } else {
      visible.value = e;
      emits("close");
    }
  }
};
</script>
<template>
  <UModal
    :open="visible"
    :title="props.title"
    :description="props.description"
    :ui="{
      header: 'p-2 sm:px-4 min-h-12',
      body: 'p-2 sm:p-4 slim-scrollbar',
      footer: 'justify-end p-2 sm:px-4',
      close: 'top-2 end-2',
      content: props.contentClass
    }"
    v-bind="$attrs"
    @update:open="handleUpdate"
    @after:leave="handleAfterLeave"
  >
    <template #body>
      <slot>
        <Content />
      </slot>
    </template>

    <template #footer>
      <slot name="footer">
        <UButton
          v-if="showCancelButton"
          color="neutral"
          variant="outline"
          v-bind="props.cancelButtonProps"
          :disabled="props.submitting"
          @click="handleCancel"
        >
          {{ props.cancelButtonText }}
        </UButton>
        <UButton
          v-if="showConfirmButton"
          color="primary"
          v-bind="props.confirmButtonProps"
          :loading="props.submitting"
          @click="handleConfirm"
        >
          {{ props.confirmButtonText }}
        </UButton>
      </slot>
    </template>
  </UModal>
</template>
