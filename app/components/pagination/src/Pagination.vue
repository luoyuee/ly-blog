<script setup lang="ts">
import type { PropType } from "vue";
import { computed, ref, watch } from "vue";

const props = defineProps({
  total: {
    type: Number,
    required: true
  },
  size: {
    type: Number,
    default: 20
  },
  pageSizes: {
    type: Array as PropType<number[]>,
    default: () => [10, 20, 50, 100]
  }
});

const page = defineModel<number>("page", { default: 1 });
const pageSize = defineModel<number>("pageSize", { default: 20 });

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / pageSize.value)));

const jumpInput = ref<number>(page.value);

watch(page, (newVal) => {
  jumpInput.value = newVal;
});

const handleJump = () => {
  if (!jumpInput.value) {
    jumpInput.value = page.value;
    return;
  }

  if (jumpInput.value >= 1 && jumpInput.value <= totalPages.value) {
    page.value = jumpInput.value;
  } else if (jumpInput.value > totalPages.value) {
    jumpInput.value = totalPages.value;
    page.value = totalPages.value;
  } else {
    jumpInput.value = page.value;
  }
};

const handleJumpKeydown = (e: KeyboardEvent) => {
  if (e.key === "Enter") handleJump();
};

const handlePageSizeChange = () => {
  page.value = 1;
};
</script>

<template>
  <div class="flex items-center gap-4 text-sm text-gray-600 whitespace-nowrap">
    <div class="flex items-center gap-2">
      <span>每页</span>
      <USelect
        v-model="pageSize"
        size="sm"
        class="w-20"
        :items="props.pageSizes"
        @change="handlePageSizeChange"
      />
      <span>条</span>
    </div>

    <UPagination v-model:page="page" size="sm" :total="total" :items-per-page="pageSize" />

    <div class="flex items-center gap-2">
      <span>跳至</span>
      <UInput
        v-model="jumpInput"
        size="sm"
        class="w-16"
        type="number"
        :min="1"
        :disabled="totalPages <= 1"
        @blur="handleJump"
        @keydown="handleJumpKeydown"
      />
      <span>页 / 共 {{ totalPages }} 页</span>
    </div>
  </div>
</template>
