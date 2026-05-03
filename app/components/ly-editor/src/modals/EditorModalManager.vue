<script setup lang="ts">
import { workspaceModalRegistry } from "../workspace/modals";
import { cancelWorkspaceModal, resolveWorkspaceModal } from "@/composables/useWorkspaceModal";

const modalStore = useEditorModalStore();

const activeModalComponent = computed(() => {
  const activeModalId = modalStore.activeModalId;

  if (!activeModalId) return;

  return workspaceModalRegistry[activeModalId];
});
</script>

<template>
  <component
    :is="activeModalComponent"
    v-if="activeModalComponent && modalStore.activeModal"
    :open="modalStore.open"
    :payload="modalStore.payload"
    @resolve="resolveWorkspaceModal"
    @close="cancelWorkspaceModal"
  />
</template>
