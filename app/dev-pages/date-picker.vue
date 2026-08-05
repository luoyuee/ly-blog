<script setup lang="ts">
import { DatePicker, RangeDatePicker } from "@/components/form/date-picker";

/** 基础日期选择 */
const baseValue = ref<string | null>(null);

/** 日期时间选择 */
const datetimeValue = ref<string | null>(null);

/** 可清空 */
const clearableValue = ref<string | null>("2025-06-15 10:30:00");

/** 禁用 */
const disabledValue = ref<string | null>("2025-01-01");

/** Date 对象值 */
const dateObjectValue = ref<Date | null>(null);

/** 自定义格式 */
const customFormatValue = ref<string | null>(null);

/** 基础范围 */
const rangeValue = ref<{ start: string | null; end: string | null } | null>(null);

/** 日期时间范围 */
const datetimeRangeValue = ref<{ start: string | null; end: string | null } | null>(null);

/** 可清空范围 */
const clearableRangeValue = ref<{ start: string | null; end: string | null } | null>({
  start: "2025-06-01",
  end: "2025-06-30"
});
</script>

<template>
  <main class="min-h-screen p-4 md:p-8">
    <section class="mx-auto mb-6 max-w-240">
      <p class="mb-2 text-sm uppercase tracking-[0.08em] text-(--text-color-tertiary)">
        Development Only
      </p>
      <h1 class="mb-3 text-2xl font-bold leading-[1.2] text-(--text-color-primary)">
        DatePicker 组件测试页
      </h1>
      <p class="text-base leading-[1.75] text-(--text-color-secondary)">
        用于验证 DatePicker 与 RangeDatePicker
        的日期选择、日期时间选择、范围选择、可清空、禁用及值类型等能力。
      </p>
    </section>

    <section
      class="mx-auto mb-4 grid max-w-240 grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]"
    >
      <!-- 1. 基础日期 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">基础日期选择</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            type=date 仅选择日期，默认字符串格式 YYYY-MM-DD HH:mm:ss。
          </p>
          <DatePicker v-model="baseValue" />
          <p class="text-xs text-(--text-color-tertiary) break-all">
            当前值: {{ baseValue ?? "空" }}
          </p>
        </div>
      </UCard>

      <!-- 2. 日期时间 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">日期时间选择</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            type=datetime 同时选择日期与时间。
          </p>
          <DatePicker v-model="datetimeValue" type="datetime" />
          <p class="text-xs text-(--text-color-tertiary) break-all">
            当前值: {{ datetimeValue ?? "空" }}
          </p>
        </div>
      </UCard>

      <!-- 3. 可清空 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">可清空</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            clearable=true 时展示清空按钮。
          </p>
          <DatePicker v-model="clearableValue" type="datetime" clearable />
          <p class="text-xs text-(--text-color-tertiary) break-all">
            当前值: {{ clearableValue ?? "空" }}
          </p>
        </div>
      </UCard>

      <!-- 4. 禁用 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">禁用</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            disabled=true 时禁止触发选择。
          </p>
          <DatePicker v-model="disabledValue" disabled />
          <p class="text-xs text-(--text-color-tertiary) break-all">
            当前值: {{ disabledValue ?? "空" }}
          </p>
        </div>
      </UCard>

      <!-- 5. Date 对象值 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">Date 对象值</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            valueType=date 时写回 Date 对象。
          </p>
          <DatePicker v-model="dateObjectValue" value-type="date" type="datetime" />
          <p class="text-xs text-(--text-color-tertiary) break-all">
            当前值: {{ dateObjectValue ? dateObjectValue.toString() : "空" }}
          </p>
        </div>
      </UCard>

      <!-- 6. 自定义格式 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">自定义格式</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            show-format 自定义展示格式，format 控制提交格式。
          </p>
          <DatePicker
            v-model="customFormatValue"
            type="datetime"
            :show-format="{ date: 'YYYY年MM月DD日', time: 'HH时mm分' }"
            format="YYYY/MM/DD HH:mm"
          />
          <p class="text-xs text-(--text-color-tertiary) break-all">
            当前值: {{ customFormatValue ?? "空" }}
          </p>
        </div>
      </UCard>
    </section>

    <!-- 范围选择 -->
    <section class="mx-auto mb-4 max-w-240">
      <h2 class="mb-3 text-lg font-bold text-(--text-color-primary)">范围选择</h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
        <UCard>
          <div class="flex flex-col gap-3">
            <h3 class="font-semibold text-(--text-color-primary)">基础范围</h3>
            <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
              type=date 仅选择日期范围。
            </p>
            <RangeDatePicker v-model="rangeValue" type="date" />
            <p class="text-xs text-(--text-color-tertiary) break-all">
              当前值: {{ rangeValue ? `${rangeValue.start} ~ ${rangeValue.end}` : "空" }}
            </p>
          </div>
        </UCard>

        <UCard>
          <div class="flex flex-col gap-3">
            <h3 class="font-semibold text-(--text-color-primary)">日期时间范围</h3>
            <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
              type=datetime 同时选择日期与时间范围。
            </p>
            <RangeDatePicker v-model="datetimeRangeValue" type="datetime" />
            <p class="text-xs text-(--text-color-tertiary) break-all">
              当前值:
              {{
                datetimeRangeValue
                  ? `${datetimeRangeValue.start} ~ ${datetimeRangeValue.end}`
                  : "空"
              }}
            </p>
          </div>
        </UCard>

        <UCard>
          <div class="flex flex-col gap-3">
            <h3 class="font-semibold text-(--text-color-primary)">可清空范围</h3>
            <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
              clearable=true 时展示清空按钮。
            </p>
            <RangeDatePicker v-model="clearableRangeValue" type="date" clearable />
            <p class="text-xs text-(--text-color-tertiary) break-all">
              当前值:
              {{
                clearableRangeValue
                  ? `${clearableRangeValue.start} ~ ${clearableRangeValue.end}`
                  : "空"
              }}
            </p>
          </div>
        </UCard>
      </div>
    </section>
  </main>
</template>
