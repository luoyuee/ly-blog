<script setup lang="ts">
import { Whiteboard } from "@/components/whiteboard";
import type { WhiteboardContent } from "@/components/whiteboard";

const content = ref<WhiteboardContent>({
  notes: [],
  strokes: [],
  connections: []
});
</script>

<template>
  <Whiteboard v-model="content" />
</template>
