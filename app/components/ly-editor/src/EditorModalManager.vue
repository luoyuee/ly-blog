<script setup lang="ts">
import NoteFolderFormModal from "./components/note-manager/NoteFolderFormModal.vue";
import NoteSaveModal from "./components/note-manager/NoteSaveModal.vue";
import NotePublishModal from "./components/note-manager/NotePublishModal.vue";
import CategoryFormModal from "./components/article-manager/CategoryFormModal.vue";
import CategoryDetailsModal from "./components/article-manager/CategoryDetailsModal.vue";

import ShortcutFormModal from "./components/navigation-website-manager/ShortcutFormModal.vue";
import SearchEngineFormModal from "./components/navigation-website-manager/SearchEngineFormModal.vue";
import NavigationWebsiteFormModal from "./components/navigation-website-manager/NavigationWebsiteFormModal.vue";
</script>
<template>
  <div>
    <NoteFolderFormModal />
    <NoteSaveModal />
    <NotePublishModal />
    <CategoryFormModal />
    <CategoryDetailsModal />

    <ShortcutFormModal />
    <SearchEngineFormModal />
    <NavigationWebsiteFormModal />
  </div>
</template>
