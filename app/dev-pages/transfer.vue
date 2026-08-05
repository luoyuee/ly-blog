<script setup lang="ts">
import { Transfer } from "@/components/form/transfer";

interface TransferItem {
  label: string;
  value: number;
  disabled?: boolean;
}

/** 基础数据 */
const baseData: TransferItem[] = [
  { label: "苹果", value: 1 },
  { label: "香蕉", value: 2 },
  { label: "橙子", value: 3 },
  { label: "葡萄", value: 4 },
  { label: "西瓜", value: 5 },
  { label: "草莓", value: 6 },
  { label: "樱桃", value: 7 },
  { label: "芒果", value: 8 }
];

const baseLeftValues = ref<Array<string | number>>([1, 2, 3, 4]);
const baseRightValues = ref<Array<string | number>>([5, 6]);

/** 禁用项数据 */
const disabledData: TransferItem[] = [
  { label: "选项 A", value: "a" },
  { label: "选项 B（禁用）", value: "b", disabled: true },
  { label: "选项 C", value: "c" },
  { label: "选项 D（禁用）", value: "d", disabled: true },
  { label: "选项 E", value: "e" }
];

const disabledLeftValues = ref<Array<string | number>>(["a", "c"]);
const disabledRightValues = ref<Array<string | number>>(["e"]);

/** 自定义字段名 */
const customFieldData = [
  { name: "北京", id: "bj" },
  { name: "上海", id: "sh" },
  { name: "广州", id: "gz" },
  { name: "深圳", id: "sz" },
  { name: "杭州", id: "hz" }
];

const customLeftValues = ref<Array<string | number>>(["bj", "sh"]);
const customRightValues = ref<Array<string | number>>([]>([]));

/** 自定义标题 */
const titledLeftValues = ref<Array<string | number>>([]);
const titledRightValues = ref<Array<string | number>>([1, 2, 3]);

/** 大量数据 */
const largeData: TransferItem[] = Array.from({ length: 20 }, (_, index) => ({
  label: `项目 ${index + 1}`,
  value: index + 1
}));

const largeLeftValues = ref<Array<string | number>>(largeData.map((item) => item.value));
const largeRightValues = ref<Array<string | number>>([]);
</script>

<template>
  <main class="min-h-screen p-4 md:p-8">
    <section class="mx-auto mb-6 max-w-240">
      <p class="mb-2 text-sm uppercase tracking-[0.08em] text-(--text-color-tertiary)">
        Development Only
      </p>
      <h1 class="mb-3 text-2xl font-bold leading-[1.2] text-(--text-color-primary)">
        Transfer 组件测试页
      </h1>
      <p class="text-base leading-[1.75] text-(--text-color-secondary)">
        用于验证 Transfer 穿梭框的基础穿梭、全选、禁用项、自定义字段名、拖拽排序及大量数据表现。
      </p>
    </section>

    <section
      class="mx-auto mb-4 grid max-w-240 grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]"
    >
      <!-- 1. 基础用法 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">基础用法</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            勾选后点击方向按钮在两栏间移动数据。
          </p>
          <Transfer
            v-model:left-values="baseLeftValues"
            v-model:right-values="baseRightValues"
            :data="baseData"
          />
          <div class="flex flex-col gap-1 text-xs text-(--text-color-tertiary)">
            <span>左侧: {{ baseLeftValues.join(", ") || "空" }}</span>
            <span>右侧: {{ baseRightValues.join(", ") || "空" }}</span>
          </div>
        </div>
      </UCard>

      <!-- 2. 禁用项 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">禁用项</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            disabled 项无法被勾选和移动。
          </p>
          <Transfer
            v-model:left-values="disabledLeftValues"
            v-model:right-values="disabledRightValues"
            :data="disabledData"
          />
          <div class="flex flex-col gap-1 text-xs text-(--text-color-tertiary)">
            <span>左侧: {{ disabledLeftValues.join(", ") || "空" }}</span>
            <span>右侧: {{ disabledRightValues.join(", ") || "空" }}</span>
          </div>
        </div>
      </UCard>

      <!-- 3. 自定义字段名 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">自定义字段名</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            labelKey / valueKey 映射业务数据字段。
          </p>
          <Transfer
            v-model:left-values="customLeftValues"
            v-model:right-values="customRightValues"
            :data="customFieldData"
            label-key="name"
            value-key="id"
          />
          <div class="flex flex-col gap-1 text-xs text-(--text-color-tertiary)">
            <span>左侧: {{ customLeftValues.join(", ") || "空" }}</span>
            <span>右侧: {{ customRightValues.join(", ") || "空" }}</span>
          </div>
        </div>
      </UCard>

      <!-- 4. 自定义标题 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">自定义标题</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            titles 自定义两栏标题。
          </p>
          <Transfer
            v-model:left-values="titledLeftValues"
            v-model:right-values="titledRightValues"
            :data="baseData"
            :titles="['未选中', '已选中']"
          />
          <div class="flex flex-col gap-1 text-xs text-(--text-color-tertiary)">
            <span>未选中: {{ titledLeftValues.join(", ") || "空" }}</span>
            <span>已选中: {{ titledRightValues.join(", ") || "空" }}</span>
          </div>
        </div>
      </UCard>
    </section>

    <!-- 5. 大量数据 + 拖拽排序 -->
    <section class="mx-auto max-w-240">
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">大量数据 + 拖拽排序</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            两栏均支持拖拽排序，验证 20 条数据的滚动与交互表现。
          </p>
          <Transfer
            v-model:left-values="largeLeftValues"
            v-model:right-values="largeRightValues"
            :data="largeData"
            :titles="['待选列表', '已选列表']"
          />
          <div class="flex flex-col gap-1 text-xs text-(--text-color-tertiary)">
            <span>待选 ({{ largeLeftValues.length }}): {{ largeLeftValues.join(", ") }}</span>
            <span>已选 ({{ largeRightValues.length }}): {{ largeRightValues.join(", ") || "空" }}</span>
          </div>
        </div>
      </UCard>
    </section>
  </main>
</template>
