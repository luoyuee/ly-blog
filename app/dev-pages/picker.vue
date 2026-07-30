<script setup lang="ts">
import { Picker } from "@/components/form/picker";
import type { PickerItems } from "@/components/form/picker";

/** 多列模式 - 基础 */
const columnsValue = ref<Array<string | number>>([]);

const columnsItems: PickerItems = [
  [
    { label: "上午", value: "am" },
    { label: "下午", value: "pm" }
  ],
  [
    { label: "周一", value: 1 },
    { label: "周二", value: 2 },
    { label: "周三", value: 3 },
    { label: "周四", value: 4 },
    { label: "周五", value: 5 }
  ]
];

/** 多列模式 - 三列 */
const threeColumnsValue = ref<Array<string | number>>([]);

const threeColumnsItems: PickerItems = [
  [
    { label: "2024 年", value: 2024 },
    { label: "2025 年", value: 2025 },
    { label: "2026 年", value: 2026 }
  ],
  [
    { label: "一季度", value: "Q1" },
    { label: "二季度", value: "Q2" },
    { label: "三季度", value: "Q3" },
    { label: "四季度", value: "Q4" }
  ],
  [
    { label: "低", value: "low" },
    { label: "中", value: "mid" },
    { label: "高", value: "high" }
  ]
];

/** 级联模式 - 省市区 */
const cascadeValue = ref<Array<string | number>>([]);

const cascadeItems: PickerItems = [
  {
    label: "广东省",
    value: "gd",
    children: [
      {
        label: "广州市",
        value: "gz",
        children: [
          { label: "天河区", value: "th", leaf: true },
          { label: "海珠区", value: "hz", leaf: true }
        ]
      },
      {
        label: "深圳市",
        value: "sz",
        children: [
          { label: "南山区", value: "ns", leaf: true },
          { label: "福田区", value: "ft", leaf: true }
        ]
      }
    ]
  },
  {
    label: "浙江省",
    value: "zj",
    children: [
      {
        label: "杭州市",
        value: "hz-city",
        children: [
          { label: "西湖区", value: "xh", leaf: true },
          { label: "余杭区", value: "yh", leaf: true }
        ]
      }
    ]
  }
];

/** 级联模式 - 自定义字段名 */
const customFieldCascadeValue = ref<Array<string | number>>([]);

const customFieldCascadeItems: PickerItems = [
  {
    name: "电子产品",
    code: "elec",
    list: [
      {
        name: "手机",
        code: "phone",
        list: [
          { name: "旗舰款", code: "flag", leaf: true },
          { name: "入门款", code: "entry", leaf: true }
        ]
      },
      {
        name: "笔记本",
        code: "laptop",
        list: [
          { name: "轻薄本", code: "thin", leaf: true },
          { name: "游戏本", code: "game", leaf: true }
        ]
      }
    ]
  }
];

/** 箭头控制 */
const arrowValue = ref<Array<string | number>>([]);

/** 可清空 */
const clearableValue = ref<Array<string | number>>([2025, "Q2"]);

/** 禁用项 */
const disabledItems: PickerItems = [
  [
    { label: "可用 A", value: "a" },
    { label: "禁用 B", value: "b", disabled: true },
    { label: "可用 C", value: "c" },
    { label: "禁用 D", value: "d", disabled: true }
  ]
];

const disabledValue = ref<Array<string | number>>([]);
</script>

<template>
  <main class="min-h-screen p-4 md:p-8">
    <section class="mx-auto mb-6 max-w-240">
      <p class="mb-2 text-sm uppercase tracking-[0.08em] text-(--text-color-tertiary)">
        Development Only
      </p>
      <h1 class="mb-3 text-2xl font-bold leading-[1.2] text-(--text-color-primary)">
        Picker 组件测试页
      </h1>
      <p class="text-base leading-[1.75] text-(--text-color-secondary)">
        用于验证 Picker 的多列平铺模式、级联模式、箭头控制、可清空、禁用项及自定义字段名等能力。
      </p>
    </section>

    <section
      class="mx-auto mb-4 grid max-w-240 grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]"
    >
      <!-- 1. 多列模式 - 基础 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">多列模式</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            两列独立选择，各列互不影响。
          </p>
          <Picker v-model="columnsValue" mode="columns" :items="columnsItems" />
          <p class="text-xs text-(--text-color-tertiary) break-all">
            当前值: {{ columnsValue.length ? columnsValue.join(" / ") : "空" }}
          </p>
        </div>
      </UCard>

      <!-- 2. 多列模式 - 三列 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">三列选择</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            年份 + 季度 + 优先级三列。
          </p>
          <Picker v-model="threeColumnsValue" mode="columns" :items="threeColumnsItems" />
          <p class="text-xs text-(--text-color-tertiary) break-all">
            当前值: {{ threeColumnsValue.length ? threeColumnsValue.join(" / ") : "空" }}
          </p>
        </div>
      </UCard>

      <!-- 3. 级联模式 - 省市区 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">级联模式</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            省/市/区逐级联动，改变上层清空下层。
          </p>
          <Picker v-model="cascadeValue" mode="cascade" :items="cascadeItems" />
          <p class="text-xs text-(--text-color-tertiary) break-all">
            当前值: {{ cascadeValue.length ? cascadeValue.join(" / ") : "空" }}
          </p>
        </div>
      </UCard>

      <!-- 4. 级联模式 - 自定义字段名 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">自定义字段名</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            使用 name / code / list 作为字段名。
          </p>
          <Picker
            v-model="customFieldCascadeValue"
            mode="cascade"
            :items="customFieldCascadeItems"
            :field-names="{
              label: 'name',
              value: 'code',
              children: 'list',
              disabled: 'disabled'
            }"
          />
          <p class="text-xs text-(--text-color-tertiary) break-all">
            当前值: {{ customFieldCascadeValue.length ? customFieldCascadeValue.join(" / ") : "空" }}
          </p>
        </div>
      </UCard>

      <!-- 5. 箭头控制 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">箭头控制</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            arrow-control=true 时使用上下箭头步进。
          </p>
          <Picker
            v-model="arrowValue"
            mode="columns"
            :items="threeColumnsItems"
            arrow-control
          />
          <p class="text-xs text-(--text-color-tertiary) break-all">
            当前值: {{ arrowValue.length ? arrowValue.join(" / ") : "空" }}
          </p>
        </div>
      </UCard>

      <!-- 6. 可清空 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">可清空</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            clearable=true 时展示清空按钮。
          </p>
          <Picker
            v-model="clearableValue"
            mode="columns"
            :items="threeColumnsItems"
            clearable
          />
          <p class="text-xs text-(--text-color-tertiary) break-all">
            当前值: {{ clearableValue.length ? clearableValue.join(" / ") : "空" }}
          </p>
        </div>
      </UCard>

      <!-- 7. 禁用项 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">禁用项</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            disabled 项不可选择，自动跳过。
          </p>
          <Picker v-model="disabledValue" mode="columns" :items="disabledItems" />
          <p class="text-xs text-(--text-color-tertiary) break-all">
            当前值: {{ disabledValue.length ? disabledValue.join(" / ") : "空" }}
          </p>
        </div>
      </UCard>
    </section>
  </main>
</template>
