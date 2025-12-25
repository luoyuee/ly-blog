<template>
  <node-view-wrapper class="code-block-wrapper">
    <div v-if="!readOnly && !disabled" class="code-block-header">
      <select :value="language" class="language-select" @change="updateLanguage">
        <option v-for="lang in languages" :key="lang.value" :value="lang.value">
          {{ lang.label }}
        </option>
      </select>
    </div>
    <pre><code><node-view-content class="content" /></code></pre>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { NodeViewWrapper, NodeViewContent, nodeViewProps } from "@tiptap/vue-3";

const props = defineProps({
  ...nodeViewProps,
  readOnly: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const language = computed(() => {
  return props.node.attrs.language || "auto";
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
];

const updateLanguage = (event: Event) => {
  const select = event.target as HTMLSelectElement;
  props.updateAttributes({
    language: select.value
  });
};
</script>

<style scoped>
.code-block-wrapper {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  margin-block: 1rem;
}

.code-block-header {
  position: absolute;
  top: 0;
  right: 0;
  padding: 4px 8px;
  /* background: #2d2d2d; */
  z-index: 10;
}

.language-select {
  background-color: #1e293b;
  color: #fff;
  border: 1px solid #555;
  border-radius: 3px;
  padding: 2px 4px;
  font-size: 12px;
  cursor: pointer;

  option {
    cursor: pointer;
  }
}

pre {
  padding-top: 30px;
  margin-block: 0;
}
</style>
