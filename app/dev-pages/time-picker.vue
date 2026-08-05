<script setup lang="ts">
import { RangeTimePicker, TimePicker } from "@/components/form/time-picker";

/** 基础用法 */
const baseValue = ref<string | null>(null);

/** 12 小时制 */
const hour12Value = ref<string | null>(null);

/** 隐藏秒 */
const noSecondValue = ref<string | null>(null);

/** 步进设置 */
const stepValue = ref<string | null>(null);

/** 箭头控制 */
const arrowValue = ref<string | null>(null);

/** 可清空 */
const clearableValue = ref<string | null>("12:30:00");

/** 禁用 */
const disabledValue = ref<string | null>("09:00:00");

/** Time 对象值 */
const timeObjectValue = ref<string | null>(null);

/** 范围选择 */
const rangeValue = ref<{ start: string | null; end: string | null } | null>(null);

/** 范围选择 - 12 小时制 */
const range12Value = ref<{ start: string | null; end: string | null } | null>(null);

/** 事件日志 */
const eventLogs = ref<string[]>([]);

const logEvent = (msg: string) => {
  const time = new Date().toLocaleTimeString("zh-CN", { hour12: false });
  eventLogs.value.unshift(`[${time}] ${msg}`);
  if (eventLogs.value.length > 8) {
    eventLogs.value.pop();
  }
};

const handleBaseConfirm = (value: unknown) => {
  logEvent(`基础用法确认: ${value ?? "空"}`);
};

const handleRangeConfirm = (value: unknown) => {
  const range = value as { start: string; end: string } | null;
  logEvent(`范围确认: ${range ? `${range.start} ~ ${range.end}` : "空"}`);
};
</script>

<template>
  <main class="min-h-screen p-4 md:p-8">
    <section class="mx-auto mb-6 max-w-240">
      <p class="mb-2 text-sm uppercase tracking-[0.08em] text-(--text-color-tertiary)">
        Development Only
      </p>
      <h1 class="mb-3 text-2xl font-bold leading-[1.2] text-(--text-color-primary)">
        TimePicker 组件测试页
      </h1>
      <p class="text-base leading-[1.75] text-(--text-color-secondary)">
        用于验证 TimePicker 与 RangeTimePicker 的基础选择、12/24
        小时制、步进、箭头控制、范围选择及各类交互边界。
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
            默认 24 小时制，包含时分秒，点击确定后写回字符串值。
          </p>
          <TimePicker v-model="baseValue" @confirm="handleBaseConfirm" />
          <p class="text-xs text-(--text-color-tertiary)">当前值: {{ baseValue ?? "空" }}</p>
        </div>
      </UCard>

      <!-- 2. 12 小时制 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">12 小时制</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            hourCycle=12 时展示上午/下午列。
          </p>
          <TimePicker v-model="hour12Value" :hour-cycle="12" show-format="hh:mm:ss a" />
          <p class="text-xs text-(--text-color-tertiary)">当前值: {{ hour12Value ?? "空" }}</p>
        </div>
      </UCard>

      <!-- 3. 隐藏秒 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">隐藏秒</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            show-second=false 时仅展示时分。
          </p>
          <TimePicker
            v-model="noSecondValue"
            :show-second="false"
            format="HH:mm"
            show-format="HH:mm"
          />
          <p class="text-xs text-(--text-color-tertiary)">当前值: {{ noSecondValue ?? "空" }}</p>
        </div>
      </UCard>

      <!-- 4. 步进设置 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">步进设置</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            分钟步进 15，秒步进 10。
          </p>
          <TimePicker v-model="stepValue" :minute-step="15" :second-step="10" />
          <p class="text-xs text-(--text-color-tertiary)">当前值: {{ stepValue ?? "空" }}</p>
        </div>
      </UCard>

      <!-- 5. 箭头控制 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">箭头控制</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            arrow-control=true 时使用上下箭头步进。
          </p>
          <TimePicker v-model="arrowValue" arrow-control />
          <p class="text-xs text-(--text-color-tertiary)">当前值: {{ arrowValue ?? "空" }}</p>
        </div>
      </UCard>

      <!-- 6. 可清空 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">可清空</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            clearable=true 时展示清空按钮。
          </p>
          <TimePicker v-model="clearableValue" clearable />
          <p class="text-xs text-(--text-color-tertiary)">当前值: {{ clearableValue ?? "空" }}</p>
        </div>
      </UCard>

      <!-- 7. 禁用 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">禁用</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            disabled=true 时禁止触发选择。
          </p>
          <TimePicker v-model="disabledValue" disabled />
          <p class="text-xs text-(--text-color-tertiary)">当前值: {{ disabledValue ?? "空" }}</p>
        </div>
      </UCard>

      <!-- 8. Time 对象值 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">Time 对象值</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            valueType=time 时写回 Time 对象。
          </p>
          <TimePicker v-model="timeObjectValue" value-type="time" />
          <p class="text-xs text-(--text-color-tertiary) break-all">
            当前值: {{ timeObjectValue ?? "空" }}
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
              RangeTimePicker 同时选择起止时间。
            </p>
            <RangeTimePicker v-model="rangeValue" @confirm="handleRangeConfirm" />
            <p class="text-xs text-(--text-color-tertiary) break-all">
              当前值: {{ rangeValue ? `${rangeValue.start} ~ ${rangeValue.end}` : "空" }}
            </p>
          </div>
        </UCard>

        <UCard>
          <div class="flex flex-col gap-3">
            <h3 class="font-semibold text-(--text-color-primary)">12 小时制范围</h3>
            <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
              范围选择器同样支持 12 小时制。
            </p>
            <RangeTimePicker v-model="range12Value" :hour-cycle="12" clearable />
            <p class="text-xs text-(--text-color-tertiary) break-all">
              当前值: {{ range12Value ? `${range12Value.start} ~ ${range12Value.end}` : "空" }}
            </p>
          </div>
        </UCard>
      </div>
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
