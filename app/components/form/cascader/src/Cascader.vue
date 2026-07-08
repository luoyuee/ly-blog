<script setup lang="ts">
import type { CascaderFieldNames, CascaderItems, CascaderPrimitive } from "./types";
import type { PropType } from "vue";
import { computed, ref, watch } from "vue";
import {
  getCascaderOutputSelection,
  getCascaderDisplayText,
  getCascaderLabelPath,
  normalizeCascaderItems,
  resolveCascaderSelection
} from "./utils";
import CascaderPanel from "./CascaderPanel.vue";

const modelValue = defineModel<CascaderPrimitive[]>({ default: () => [] });

const props = defineProps({
  items: {
    type: Array as PropType<CascaderItems>,
    default: () => []
  },
  fieldNames: {
    type: Object as PropType<CascaderFieldNames>,
    default: () => ({
      label: "label",
      value: "value",
      children: "children",
      disabled: "disabled",
      leaf: "leaf"
    })
  },
  disabled: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: "请选择"
  },
  separator: {
    type: String,
    default: "/"
  },
  showAllLevels: {
    type: Boolean,
    default: true
  },
  checkStrictly: {
    type: Boolean,
    default: false
  },
  popoverContentClass: {
    type: String,
    default: ""
  }
});

const emit = defineEmits<{
  change: [value: CascaderPrimitive[]];
}>();

type CascaderTriggerSlotProps = {
  selected: CascaderPrimitive[];
  open: boolean;
  displayText: string;
  clearable: boolean;
  disabled: boolean;
  placeholder: string;
  clear: () => void;
};

defineSlots<{
  trigger?: (props: CascaderTriggerSlotProps) => unknown;
}>();

const popoverOpen = ref(false);
const tempSelection = ref<CascaderPrimitive[]>([]);

const normalizedItems = computed(() => {
  return normalizeCascaderItems(props.items, props.fieldNames);
});

const displayText = computed(() => {
  return getCascaderDisplayText({
    rootNodes: normalizedItems.value,
    selection: modelValue.value,
    placeholder: props.placeholder,
    separator: props.separator,
    showAllLevels: props.showAllLevels
  });
});

const selectedLabels = computed(() => {
  return getCascaderLabelPath(normalizedItems.value, modelValue.value);
});

const hasValue = computed(() => selectedLabels.value.length > 0);

const canClear = computed(() => {
  return !props.disabled && props.clearable && hasValue.value;
});

const popoverUi = computed(() => ({
  content: ` p-0 ${props.popoverContentClass}`
}));

const syncTempSelection = () => {
  tempSelection.value = modelValue.value.slice();
};

const initializeTempSelection = () => {
  tempSelection.value = getCascaderOutputSelection(
    resolveCascaderSelection({
      sourceSelection: modelValue.value,
      rootNodes: normalizedItems.value,
      checkStrictly: props.checkStrictly
    }).selection
  );
};

watch(
  modelValue,
  () => {
    if (!popoverOpen.value) {
      syncTempSelection();
    }
  },
  { immediate: true, deep: true }
);

watch(popoverOpen, (newVal) => {
  if (newVal) {
    initializeTempSelection();
  }
});

const updateModelValue = (value: CascaderPrimitive[]) => {
  modelValue.value = value;
  emit("change", value);
};

const handleChange = (value: CascaderPrimitive[]) => {
  tempSelection.value = value;

  const resolved = resolveCascaderSelection({
    sourceSelection: value,
    rootNodes: normalizedItems.value,
    checkStrictly: props.checkStrictly
  });

  if (!resolved.isSelectable) {
    return;
  }

  const nextValue = resolved.selection.filter(
    (item): item is CascaderPrimitive => item !== undefined
  );

  updateModelValue(nextValue);
  popoverOpen.value = false;
};

const handleClear = () => {
  updateModelValue([]);
  tempSelection.value = [];
  popoverOpen.value = false;
};
</script>

<template>
  <UPopover
    v-model:open="popoverOpen"
    :ui="popoverUi"
    :content="{
      align: 'start'
    }"
  >
    <slot
      name="trigger"
      :selected="modelValue"
      :open="popoverOpen"
      :display-text="displayText"
      :clearable="canClear"
      :disabled="props.disabled"
      :placeholder="props.placeholder"
      :clear="handleClear"
    >
      <UButton
        color="neutral"
        variant="outline"
        class="w-full justify-between"
        :disabled="props.disabled"
      >
        <span
          class="min-w-0 flex-1 truncate text-left"
          :class="hasValue ? 'text-highlighted' : 'text-dimmed'"
        >
          {{ displayText }}
        </span>

        <template #trailing>
          <UIcon
            v-if="canClear"
            name="lucide:circle-x"
            class="size-4 text-dimmed hover:text-muted"
            @click.stop="handleClear"
          />
          <UIcon
            v-else
            name="lucide:chevron-down"
            class="size-4 text-dimmed transition-transform"
            :class="popoverOpen ? 'rotate-180' : ''"
          />
        </template>
      </UButton>
    </slot>

    <template #content>
      <CascaderPanel
        v-model="tempSelection"
        class="rounded-md"
        :items="props.items"
        :field-names="props.fieldNames"
        :disabled="props.disabled"
        :check-strictly="props.checkStrictly"
        @change="handleChange"
      />
    </template>
  </UPopover>
</template>
