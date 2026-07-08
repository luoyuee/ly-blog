<script setup lang="ts">
import type { UISize } from "#shared/types";
import type { PropType } from "vue";
import { computed, ref, watch } from "vue";
import numeral from "numeral";

const props = defineProps({
  total: {
    type: Number,
    required: true
  },
  size: {
    type: String as PropType<UISize>,
    default: "md"
  },
  pageSizes: {
    type: Array as PropType<number[]>,
    default: () => [50, 100, 200, 500, 1000]
  }
});

const textSizeMap: Record<UISize, string> = {
  xs: "text-xs",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-sm",
  xl: "text-base"
};

const textSize = computed(() => textSizeMap[props.size]);

const page = defineModel<number>("page", { default: 1 });
const pageSize = defineModel<number>("pageSize", { default: 20 });

/**
 * 基于总条数与每页条数计算总页数，至少保留 1 页，避免分页组件出现异常边界。
 */
const totalPages = computed(() => Math.max(1, Math.ceil(props.total / pageSize.value)));

const jumpInput = ref<number>(page.value);

/**
 * 当前页变化时，同步更新跳转输入框，避免展示旧值。
 */
watch(page, (newVal) => {
  jumpInput.value = newVal;
});

/**
 * 当外部总条数变化导致总页数收缩时，主动修正当前页，避免页码越界。
 */
watch(totalPages, (newVal) => {
  if (page.value > newVal) {
    page.value = newVal;
    return;
  }

  jumpInput.value = page.value;
});

/**
 * 统一校正页码值，确保跳页逻辑和边界处理保持一致。
 */
const normalizePage = (targetPage: number) => {
  if (!Number.isFinite(targetPage)) {
    return page.value;
  }

  return Math.min(Math.max(Math.trunc(targetPage), 1), totalPages.value);
};

/**
 * 提交跳页输入时，按有效页码范围进行修正并同步到分页组件。
 */
const handleJump = () => {
  const nextPage = normalizePage(jumpInput.value);

  jumpInput.value = nextPage;
  page.value = nextPage;
};

/**
 * 仅在回车时触发跳页，避免普通输入过程被打断。
 */
const handleJumpKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    handleJump();
  }
};

/**
 * 切换每页条数后回到第一页，避免新分页尺寸下落在无效页码。
 */
const handlePageSizeChange = () => {
  page.value = 1;
};

const pageSizeOptions = computed(() => {
  return props.pageSizes.map((size) => ({ label: `${size}/页`, value: size }));
});

/**
 * 总条数文案单独抽离，模板层只负责展示。
 */
const totalText = computed(() => `共「${numeral(props.total).format("0,0")}」条数据`);
</script>

<template>
  <div :class="['flex justify-between items-center gap-4', textSize]">
    <div class="text-sm">
      {{ totalText }}
    </div>

    <div class="flex gap-4 items-center">
      <USelect
        v-model="pageSize"
        :items="pageSizeOptions"
        class="w-24"
        @change="handlePageSizeChange"
      />

      <UPagination
        v-model:page="page"
        :size="props.size"
        :total="total"
        :items-per-page="pageSize"
      />

      <div class="flex items-center gap-2">
        <span>跳转至</span>
        <UInputNumber
          v-model="jumpInput"
          class="w-20"
          orientation="vertical"
          :increment="{ color: 'neutral' }"
          :decrement="{ color: 'neutral' }"
          :size="props.size"
          :min="1"
          :disabled="totalPages <= 1"
          @blur="handleJump"
          @keydown="handleJumpKeydown"
        />
        <span>页 / {{ totalPages }} 页</span>
      </div>
    </div>
  </div>
</template>
