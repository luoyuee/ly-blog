<script setup lang="ts">
import { lyEditorModalRegistry } from "../registry";
import { useLyEditorModal } from "@/composables/useLyEditorModal";
import { useLyEditorStore } from "@/stores";

const lyEditorStore = useLyEditorStore();
const { resolveModal, cancelModal } = useLyEditorModal();

const activeModalComponent = computed(() => {
  const activeModalKey = lyEditorStore.activeModalKey;

  if (!activeModalKey) return;

  return lyEditorModalRegistry[activeModalKey];
});
</script>

<template>
  <component
    :is="activeModalComponent"
    v-if="activeModalComponent && lyEditorStore.modal.active"
    :visible="lyEditorStore.hasActiveModal"
    :payload="lyEditorStore.activeModalPayload"
    @resolve="resolveModal"
    @close="cancelModal"
  />
</template>
