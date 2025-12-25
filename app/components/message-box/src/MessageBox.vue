<script setup lang="ts">
import type { ButtonProps } from "@nuxt/ui";

const visible = defineModel<boolean>("visible", { default: true });

const emits = defineEmits(["close", "confirm", "cancel", "afterLeave"]);

const props = defineProps({
  title: {
    type: String
  },
  message: {
    type: String
  },
  icon: {
    type: String
  },
  iconClass: {
    type: String
  },
  titleClass: {
    type: String
  },
  messageClass: {
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

const handleAfterLeave = () => {
  emits("afterLeave");
};

const handleClose = () => {
  emits("close");
  visible.value = false;
};

const handleConfirm = () => {
  emits("confirm");
  visible.value = false;
};

const handleCancel = () => {
  emits("cancel");
  visible.value = false;
};
</script>
<template>
  <UModal v-model:open="visible" @after:leave="handleAfterLeave">
    <template #content>
      <div class="p-4 relative" :class="props.titleClass">
        <div v-if="props.title">
          {{ props.title }}
        </div>
        <UButton
          v-if="props.showCloseButton"
          color="neutral"
          variant="ghost"
          icon="ep:close"
          class="absolute top-1 right-1"
          size="sm"
          @click="handleClose"
        />
        <div class="flex items-center mt-4">
          <UIcon
            v-if="props.icon"
            :name="props.icon"
            class="w-6 h-6 flex-shrink-0 mr-2"
            :class="props.iconClass"
          />

          <div
            v-if="props.message"
            class="flex-1 text-sm text-gray-400"
            :class="props.messageClass"
          >
            {{ props.message }}
          </div>
        </div>

        <div class="mt-4 flex justify-end gap-2">
          <UButton
            v-if="showCancelButton"
            color="neutral"
            variant="outline"
            v-bind="props.cancelButtonProps"
            @click="handleCancel"
          >
            {{ props.cancelButtonText }}
          </UButton>
          <UButton
            v-if="showConfirmButton"
            color="primary"
            v-bind="props.confirmButtonProps"
            @click="handleConfirm"
          >
            {{ props.confirmButtonText }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
