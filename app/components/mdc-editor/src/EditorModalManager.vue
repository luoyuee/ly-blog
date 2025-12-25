<script setup lang="ts">
import NoteSaveModal from "@/components/mdc-editor/src/components/note-manager/NoteSaveModal.vue";
import NotePublishModal from "@/components/mdc-editor/src/components/note-manager/NotePublishModal.vue";
import CategoryFormModal from "@/components/mdc-editor/src/components/article-manager/CategoryFormModal.vue";
import CategoryDetailsModal from "@/components/mdc-editor/src/components/article-manager/CategoryDetailsModal.vue";
</script>
<template>
  <div>
    <NoteSaveModal />
    <NotePublishModal />
    <CategoryFormModal />
    <CategoryDetailsModal />
  </div>
</template>
