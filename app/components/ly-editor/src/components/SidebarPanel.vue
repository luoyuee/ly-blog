<script setup lang="ts">
import { IndeterminateProgressBar } from "@/components/progress";
import { ResizeArea } from "@/components/resize-area";
import { useLyEditorStore } from "@/stores";

type ActionItem = {
  label: string;
  icon: string;
  onClick: () => void;
};

const props = defineProps({
  title: {
    type: String,
    default: ""
  },
  actions: {
    type: Array as PropType<ActionItem[]>,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  showHeader: {
    type: Boolean,
    default: true
  }
});

const lyEditorStore = useLyEditorStore();
</script>

<template>
  <client-only>
    <ResizeArea
      v-model:width="lyEditorStore.sidebar.width"
      position="right"
      class="h-full"
      :max-width="400"
    >
      <div class="sidebar-panel" @contextmenu.prevent>
        <div v-if="showHeader" class="sidebar-panel__header">
          <slot name="header">
            <div class="sidebar-panel__title">{{ props.title }}</div>
            <div v-if="$slots.actions || props.actions.length" class="sidebar-panel__actions">
              <slot name="actions">
                <UTooltip
                  v-for="item in props.actions"
                  :key="item.label"
                  :text="item.label"
                  :content="{ side: 'top' }"
                  ignore-non-keyboard-focus
                >
                  <span class="sidebar-panel__actions-item" @click="item.onClick">
                    <UIcon :name="item.icon" />
                  </span>
                </UTooltip>
              </slot>
            </div>
          </slot>
        </div>

        <IndeterminateProgressBar :loading="props.loading" />

        <slot></slot>
      </div>
    </ResizeArea>
  </client-only>
</template>
<style scoped lang="scss">
.sidebar-panel {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &__header {
    font-size: 0.875rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #2b2b2b;
    height: 34px;
    padding: 0 6px;
    line-height: 1;
  }

  &__title {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  &__actions {
    display: flex;
    align-items: center;

    &-item {
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      &:hover {
        background-color: rgba(235, 240, 250, 0.06);
      }
    }
  }
}
</style>
