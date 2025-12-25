<script setup lang="ts">
const props = defineProps({
  text: {
    type: String
  }
});

const copied = ref(false);
const handleCopy = () => {
  if (props.text) {
    navigator.clipboard
      .writeText(props.text)
      .then(() => {
        copied.value = true;
        setTimeout(() => {
          copied.value = false;
        }, 1000);
      })
      .catch(() => {
        copied.value = false;
      });
  }
};
</script>
<template>
  <div class="typography copyable">
    {{ props.text }}
    <UTooltip :text="copied ? '已复制' : '复制'" placement="top">
      <UButton v-if="copied" icon="ep:check" color="success" variant="ghost" size="xs" />
      <UButton
        v-else
        icon="ep:copy-document"
        color="primary"
        variant="ghost"
        size="xs"
        @click="handleCopy"
      />
    </UTooltip>
  </div>
</template>
<style scoped lang="scss">
.typography.copyable {
  .el-icon {
    margin-left: 2px;
    vertical-align: middle;
  }
  .el-icon.copyable {
    cursor: pointer;
    &:hover {
      color: var(--el-color-primary);
    }
  }
}
</style>
