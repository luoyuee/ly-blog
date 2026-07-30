<script setup lang="ts">
import { Cascader } from "@/components/form/cascader";
import type { CascaderItems } from "@/components/form/cascader";

/** 基础级联 - 省市区 */
const baseValue = ref<Array<string | number>>([]);

const baseItems: CascaderItems = [
  {
    label: "广东省",
    value: "gd",
    children: [
      {
        label: "广州市",
        value: "gz",
        children: [
          { label: "天河区", value: "th", leaf: true },
          { label: "海珠区", value: "hz", leaf: true },
          { label: "越秀区", value: "yx", leaf: true }
        ]
      },
      {
        label: "深圳市",
        value: "sz",
        children: [
          { label: "南山区", value: "ns", leaf: true },
          { label: "福田区", value: "ft", leaf: true },
          { label: "宝安区", value: "ba", leaf: true }
        ]
      },
      {
        label: "珠海市",
        value: "zh",
        children: [
          { label: "香洲区", value: "xz", leaf: true },
          { label: "斗门区", value: "dm", leaf: true }
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
      },
      {
        label: "宁波市",
        value: "nb",
        children: [
          { label: "海曙区", value: "hs", leaf: true },
          { label: "江北区", value: "jb", leaf: true }
        ]
      }
    ]
  },
  {
    label: "江苏省",
    value: "js",
    children: [
      {
        label: "南京市",
        value: "nj",
        children: [
          { label: "玄武区", value: "xw", leaf: true },
          { label: "鼓楼区", value: "gl", leaf: true }
        ]
      }
    ]
  }
];

/** 可清空 */
const clearableValue = ref<Array<string | number>>(["gd", "sz", "ns"]);

/** 禁用 */
const disabledValue = ref<Array<string | number>>(["zj", "hz-city"]);

/** 禁用项数据 */
const disabledItems: CascaderItems = [
  {
    label: "分类 A",
    value: "a",
    disabled: true,
    children: [{ label: "子项 A1", value: "a1", leaf: true }]
  },
  {
    label: "分类 B",
    value: "b",
    children: [
      { label: "子项 B1（禁用）", value: "b1", disabled: true, leaf: true },
      { label: "子项 B2", value: "b2", leaf: true }
    ]
  }
];

const disabledItemsValue = ref<Array<string | number>>([]);

/** checkStrictly - 可选任意层级 */
const strictlyValue = ref<Array<string | number>>([]);

/** 自定义字段名 */
const customFieldValue = ref<Array<string | number>>([]);

const customFieldItems: CascaderItems = [
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
  },
  {
    name: "家居用品",
    code: "home",
    list: [
      {
        name: "家具",
        code: "furniture",
        list: [
          { name: "桌椅", code: "table", leaf: true },
          { name: "床铺", code: "bed", leaf: true }
        ]
      }
    ]
  }
];

/** 自定义分隔符与展示 */
const separatorValue = ref<Array<string | number>>([]);

/** 事件日志 */
const eventLogs = ref<string[]>([]);

const logEvent = (msg: string) => {
  const time = new Date().toLocaleTimeString("zh-CN", { hour12: false });
  eventLogs.value.unshift(`[${time}] ${msg}`);
  if (eventLogs.value.length > 8) {
    eventLogs.value.pop();
  }
};
</script>

<template>
  <main class="min-h-screen p-4 md:p-8">
    <section class="mx-auto mb-6 max-w-240">
      <p class="mb-2 text-sm uppercase tracking-[0.08em] text-(--text-color-tertiary)">
        Development Only
      </p>
      <h1 class="mb-3 text-2xl font-bold leading-[1.2] text-(--text-color-primary)">
        Cascader 组件测试页
      </h1>
      <p class="text-base leading-[1.75] text-(--text-color-secondary)">
        用于验证 Cascader 的级联选择、可清空、禁用项、checkStrictly 可选任意层级、自定义字段名及分隔符等能力。
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
            逐级展开选择，仅叶子节点可选。
          </p>
          <Cascader
            v-model="baseValue"
            :items="baseItems"
            @change="(v) => logEvent(`基础选择: ${v.join(' / ')}`)"
          />
          <p class="text-xs text-(--text-color-tertiary) break-all">
            当前值: {{ baseValue.length ? baseValue.join(" / ") : "空" }}
          </p>
        </div>
      </UCard>

      <!-- 2. 可清空 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">可清空</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            clearable=true 时展示清空按钮。
          </p>
          <Cascader v-model="clearableValue" :items="baseItems" clearable />
          <p class="text-xs text-(--text-color-tertiary) break-all">
            当前值: {{ clearableValue.length ? clearableValue.join(" / ") : "空" }}
          </p>
        </div>
      </UCard>

      <!-- 3. 禁用 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">禁用</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            disabled=true 时禁止触发选择。
          </p>
          <Cascader v-model="disabledValue" :items="baseItems" disabled />
          <p class="text-xs text-(--text-color-tertiary) break-all">
            当前值: {{ disabledValue.length ? disabledValue.join(" / ") : "空" }}
          </p>
        </div>
      </UCard>

      <!-- 4. 禁用项 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">禁用项</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            节点 disabled=true 时不可选择。
          </p>
          <Cascader v-model="disabledItemsValue" :items="disabledItems" clearable />
          <p class="text-xs text-(--text-color-tertiary) break-all">
            当前值: {{ disabledItemsValue.length ? disabledItemsValue.join(" / ") : "空" }}
          </p>
        </div>
      </UCard>

      <!-- 5. checkStrictly 可选任意层级 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">可选任意层级</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            checkStrictly=true 时非叶子节点也可直接选择。
          </p>
          <Cascader v-model="strictlyValue" :items="baseItems" check-strictly clearable />
          <p class="text-xs text-(--text-color-tertiary) break-all">
            当前值: {{ strictlyValue.length ? strictlyValue.join(" / ") : "空" }}
          </p>
        </div>
      </UCard>

      <!-- 6. 自定义字段名 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">自定义字段名</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            使用 name / code / list 作为字段名。
          </p>
          <Cascader
            v-model="customFieldValue"
            :items="customFieldItems"
            :field-names="{
              label: 'name',
              value: 'code',
              children: 'list',
              disabled: 'disabled',
              leaf: 'leaf'
            }"
            clearable
          />
          <p class="text-xs text-(--text-color-tertiary) break-all">
            当前值: {{ customFieldValue.length ? customFieldValue.join(" / ") : "空" }}
          </p>
        </div>
      </UCard>

      <!-- 7. 自定义分隔符 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">自定义分隔符</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            separator 控制展示文案的分隔符。
          </p>
          <Cascader
            v-model="separatorValue"
            :items="baseItems"
            separator=" > "
            clearable
          />
          <p class="text-xs text-(--text-color-tertiary) break-all">
            当前值: {{ separatorValue.length ? separatorValue.join(" / ") : "空" }}
          </p>
        </div>
      </UCard>
    </section>

    <!-- 事件日志 -->
    <section class="mx-auto max-w-240">
      <UCard>
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <h2 class="font-semibold text-(--text-color-primary)">事件日志</h2>
            <UButton
              color="neutral"
              variant="ghost"
              size="xs"
              icon="lucide:trash-2"
              @click="eventLogs = []"
            >
              清空
            </UButton>
          </div>
          <div class="flex flex-col gap-1">
            <p
              v-for="(log, index) in eventLogs"
              :key="index"
              class="m-0 text-xs font-mono text-(--text-color-secondary)"
            >
              {{ log }}
            </p>
            <p v-if="eventLogs.length === 0" class="m-0 text-xs text-(--text-color-tertiary)">
              暂无事件
            </p>
          </div>
        </div>
      </UCard>
    </section>
  </main>
</template>
