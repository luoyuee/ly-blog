<template>
  <node-view-wrapper class="code-block-wrapper">
    <div v-if="isEditable" class="code-block-wrapper__header">
      <select
        :value="language"
        class="code-block-wrapper__language-select"
        @change="updateLanguage"
      >
        <option v-for="item in languages" :key="item.value" :value="item.value">
          {{ item.label }}
        </option>
      </select>
    </div>
    <pre
      class="code-block-wrapper__pre"
    ><code><node-view-content class="code-block-wrapper__content" /></code></pre>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { NodeViewContent, NodeViewWrapper, nodeViewProps } from "@tiptap/vue-3";

const props = defineProps({
  ...nodeViewProps
});

const languages = [
  { value: "auto", label: "自动检测" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "js", label: "JavaScript" },
  { value: "ts", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "rust", label: "Rust" }
] as const;

const isEditable = computed(() => props.editor.isEditable);
const language = computed(() => props.node.attrs.language || "auto");

const updateLanguage = (event: Event) => {
  const select = event.target;

  if (!(select instanceof HTMLSelectElement)) {
    return;
  }

  props.updateAttributes({
    language: select.value
  });
};
</script>

<style scoped>
.code-block-wrapper {
  position: relative;
  margin-block: 1rem;
  overflow: hidden;
  border-radius: 0.5rem;
}

.code-block-wrapper__header {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 10;
}

.code-block-wrapper__language-select {
  min-width: 7rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid rgb(71 85 105 / 0.8);
  border-radius: 0.375rem;
  background-color: rgb(15 23 42 / 0.92);
  color: #fff;
  font-size: 0.75rem;
  cursor: pointer;
}

.code-block-wrapper__pre {
  margin-block: 0;
  padding-top: 2.25rem;
}
</style>
