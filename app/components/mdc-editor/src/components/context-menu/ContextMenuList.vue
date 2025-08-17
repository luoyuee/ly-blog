<script setup lang="ts">
import type { ContextMenuItem } from "@/components/editor";
import type { PropType } from "vue";
import { editorEmitter } from "@/events";
import IconFont from "@/components/icon-font";

const props = defineProps({
  menu: {
    type: Array as PropType<ContextMenuItem[]>,
    default: () => [],
  },
  data: {
    type: Object as PropType<any>,
  },
});

const handleClickItem = (e: ContextMenuItem) => {
  editorEmitter.emit("context-menu:hide-all");
  if (e.func) e.func(props.data);
};
</script>
<template>
  <ul class="context-menu-list">
    <li
      class="context-menu-item"
      v-for="item in props.menu"
      @click="handleClickItem(item)"
    >
      <span>
        <IconFont v-if="item.icon" :icon="item.icon" class="mr-1" />
        {{ item.label }}
      </span>
      <span v-if="item.children">
        <IconFont icon="icon-right" />
      </span>
      <ContextMenuList
        class="sub-context-menu"
        v-if="item.children"
        :menu="item.children"
      />
    </li>
  </ul>
</template>
<style scoped lang="less">
.context-menu-list {
  list-style: none;
  width: 160px;
  background-color: #1f1f1f;
  border: 1px solid #454545;
  color: #ffffff;
  box-shadow: 0 0 6px 2px #060606;
  border-radius: 4px;

  .context-menu-item {
    line-height: 24px;
    position: relative;
    font-size: 0.875rem;
    padding: 6px 8px;
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;

    &:hover {
      background-color: #04395e;

      > .sub-context-menu {
        display: block;
      }
    }

    .sub-context-menu {
      position: absolute;
      right: -160px;
      top: 0;
      display: none;
    }
  }
}
</style>
