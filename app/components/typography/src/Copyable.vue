<script setup lang="ts">
import { CopyDocument, CircleCheckFilled } from "@element-plus/icons-vue";

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
  <div class="copyable">
    <span class="copyable__text">
      <slot>
        {{ props.text }}
      </slot>
    </span>
    <el-tooltip :content="copied ? '已复制！' : '点击复制'" placement="top">
      <el-icon v-if="copied" class="copyable__icon copyable__icon--copied">
        <CircleCheckFilled />
      </el-icon>
      <el-icon v-else class="copyable__icon copyable__icon--copyable" @click="handleCopy">
        <CopyDocument />
      </el-icon>
    </el-tooltip>
  </div>
</template>
<style scoped lang="scss">
.copyable {
  display: inline-flex;
  align-items: center;

  &__text {
    padding-right: 0.25rem;
  }

  &__icon {
    margin-left: 2px;
    vertical-align: middle;

    &--copyable {
      cursor: pointer;
      &:hover {
        color: var(--el-color-primary);
      }
    }

    &--copied {
      color: var(--el-color-success);
    }
  }
}
</style>
