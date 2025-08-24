import type { ClientOnly } from '#build/components';
<script setup lang="ts">
import { ElDialog } from "element-plus";
import { Close } from "@element-plus/icons-vue";

const visible = defineModel<boolean>({ default: false });

const props = defineProps({
  width: {
    type: [Number, String],
    default: 560
  },
  title: {
    type: String,
    default: ""
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
  cancelText: {
    type: String,
    default: "取消"
  },
  confirmText: {
    type: String,
    default: "确认"
  }
});

const emits = defineEmits(["update:visible", "cancel", "ok", "open"]);

const handleCancel = () => {
  emits("update:visible", false);
  emits("cancel");
};

const handleOk = () => {
  emits("ok");
};
</script>
<template>
  <ClientOnly>
    <ElDialog
      v-model="visible"
      class="el-basic-modal"
      destroy-on-close
      v-bind="$attrs"
      :width="props.width"
      :show-close="false"
      @close="handleCancel"
      @open="emits('open')"
    >
      <template #header="{ close }">
        <span class="title">
          {{ props.title }}
        </span>
        <el-button type="text" link size="large" @click="close">
          <template #icon>
            <el-icon :size="18">
              <Close />
            </el-icon>
          </template>
        </el-button>
      </template>
      <slot> </slot>
      <template #footer>
        <slot name="footer">
          <el-button :disabled="props.submitting" @click="handleCancel">
            {{ props.cancelText }}
          </el-button>
          <el-button type="primary" :loading="props.submitting" @click="handleOk">
            {{ props.confirmText }}
          </el-button>
        </slot>
      </template>
    </ElDialog>
  </ClientOnly>
</template>
<style lang="scss">
.el-basic-modal {
  .el-dialog__header {
    color: var(--text-color);
  }
}
</style>
