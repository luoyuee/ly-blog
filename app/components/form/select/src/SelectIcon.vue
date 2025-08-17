<script setup lang="ts">
import type { IconFontType } from "@/components/icon-font";
import type { PropType } from "vue";
import { ArrowDown, CircleClose } from "@element-plus/icons-vue";
import IconFont from "@/components/icon-font";

const props = defineProps({
  value: {
    type: String as PropType<IconFontType>
  },
  options: {
    type: Array as PropType<IconFontType[]>,
    default: () => []
  }
});

const emits = defineEmits(["update:value"]);

const state = reactive<{
  visible: boolean;
  clearIcon: boolean;
}>({
  visible: false,
  clearIcon: false
});

const inputRef = ref();
const { width } = useElementSize(inputRef);

const handleClick = (icon: string): void => {
  state.visible = false;
  emits("update:value", icon);
};

const handleMouseEnter = (): void => {
  if (props.value) {
    state.clearIcon = true;
  }
};

const handleMousEleave = (): void => {
  state.clearIcon = false;
};

const handleClear = (): void => {
  state.clearIcon = false;
  emits("update:value", undefined);
};
</script>
<template>
  <el-popover
    v-model:visible="state.visible"
    trigger="click"
    :width="width"
    :show-arrow="false"
    popper-class="el-icon-select-dropdown"
  >
    <ul class="el-icon-select-dropdown__list">
      <li v-for="icon in props.options" :key="icon" @click="handleClick(icon)">
        <IconFont :icon="icon" :size="20" />
      </li>
    </ul>
    <template #reference>
      <el-input
        ref="inputRef"
        class="el-icon-select"
        placeholder="请选择图标"
        readonly
        :model-value="props.value"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMousEleave"
      >
        <template #prefix>
          <IconFont v-if="props.value" :icon="props.value" :size="20" />
        </template>
        <template #suffix>
          <el-icon class="el-input__icon" :class="{ 'is-reverse': state.visible }">
            <CircleClose v-if="state.clearIcon" @click.stop="handleClear" />
            <ArrowDown v-else />
          </el-icon>
        </template>
      </el-input>
    </template>
  </el-popover>
</template>
<style lang="scss">
.el-icon-select-dropdown {
  .el-icon-select-dropdown__list {
    display: flex;
    gap: 6px;
    list-style: none;
    flex-wrap: wrap;
    li {
      cursor: pointer;
      padding: 6px;
      border-radius: 3px;

      &:hover {
        background-color: var(--el-color-primary-light-9);
      }
    }
  }
}

.el-icon-select {
  .el-input__wrapper {
    cursor: pointer;
    .el-input__inner {
      cursor: pointer;
    }
  }
  .el-input__icon.is-reverse {
    transform: rotateZ(-180deg);
  }
}
</style>
