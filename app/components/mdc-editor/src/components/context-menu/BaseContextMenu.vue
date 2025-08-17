<script setup lang="ts">
import type { ContextMenuItem } from "@/components/editor";
import { editorEmitter } from "@/events";
import ContextMenuList from "./ContextMenuList.vue";

const props = defineProps({
  menu: {
    type: Array as PropType<ContextMenuItem[]>,
    default: () => [],
  },
});

const state = reactive<{
  x: number;
  y: number;
  visible: boolean;
  data: any;
}>({
  x: 0,
  y: 0,
  visible: false,
  data: undefined,
});

const handleShow = (e: { x: number; y: number; data?: any }) => {
  state.x = e.x;
  state.y = e.y;
  state.data = e.data;

  editorEmitter.emit("context-menu:hide-all");

  state.visible = true;
};

const handleHide = () => {
  state.visible = false;
};

editorEmitter.on("context-menu:hide-all", (e?: string[]) => {
  state.visible = false;
});

defineExpose({
  show: handleShow,
  hide: handleHide,
});
</script>
<template>
  <div
    class="base-context-menu"
    :style="{ top: state.y + 'px', left: state.x + 'px' }"
    v-show="state.visible"
    @click.stop
  >
    <ContextMenuList :menu="props.menu" :data="state.data" />
  </div>
</template>
<style scoped lang="less">
.base-context-menu {
  position: fixed;
  user-select: none;
  z-index: 999999;
}
</style>
