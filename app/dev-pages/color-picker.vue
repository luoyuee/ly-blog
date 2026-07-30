<script setup lang="ts">
import { ColorPicker, ColorPickerWithAlpha } from "@/components/form/color-picker";

/** 基础颜色 */
const baseColor = ref<string | undefined>("#3B82F6");

/** RGB 格式 */
const rgbColor = ref<string | undefined>("rgb(34, 197, 94)");

/** HSL 格式 */
const hslColor = ref<string | undefined>("hsl(280, 70%, 50%)");

/** 带透明度 */
const alphaColor = ref<string | undefined>("rgba(59, 130, 246, 0.5)");

/** 可清空 */
const clearableColor = ref<string | undefined>("#F59E0B");

/** 禁用 */
const disabledColor = ref<string | undefined>("#EF4444");

/** 不同尺寸 */
const xsColor = ref<string | undefined>("#8B5CF6");
const lgColor = ref<string | undefined>("#EC4899");

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
        ColorPicker 组件测试页
      </h1>
      <p class="text-base leading-[1.75] text-(--text-color-secondary)">
        用于验证 ColorPicker 与 ColorPickerWithAlpha 的多种颜色格式、透明度调节、可清空、禁用及尺寸等能力。
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
            默认 hex 格式，点击按钮弹出颜色选择面板。
          </p>
          <ColorPicker
            v-model="baseColor"
            label="选择颜色"
            @update:model-value="(v) => logEvent(`基础选择: ${v ?? '空'}`)"
          />
          <p class="text-xs text-(--text-color-tertiary) break-all">
            当前值: {{ baseColor ?? "空" }}
          </p>
        </div>
      </UCard>

      <!-- 2. RGB 格式 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">RGB 格式</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            format=rgb 时输入输出为 rgb() 字符串。
          </p>
          <ColorPicker v-model="rgbColor" format="rgb" label="RGB 颜色" />
          <p class="text-xs text-(--text-color-tertiary) break-all">
            当前值: {{ rgbColor ?? "空" }}
          </p>
        </div>
      </UCard>

      <!-- 3. HSL 格式 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">HSL 格式</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            format=hsl 时输入输出为 hsl() 字符串。
          </p>
          <ColorPicker v-model="hslColor" format="hsl" label="HSL 颜色" />
          <p class="text-xs text-(--text-color-tertiary) break-all">
            当前值: {{ hslColor ?? "空" }}
          </p>
        </div>
      </UCard>

      <!-- 4. 带透明度 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">带透明度</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            ColorPickerWithAlpha 支持透明度滑块，输出 rgba() 格式。
          </p>
          <ColorPickerWithAlpha
            v-model="alphaColor"
            label="透明度颜色"
            @update:model-value="(v) => logEvent(`透明度选择: ${v ?? '空'}`)"
          />
          <p class="text-xs text-(--text-color-tertiary) break-all">
            当前值: {{ alphaColor ?? "空" }}
          </p>
        </div>
      </UCard>

      <!-- 5. 可清空（重置） -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">重置</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            弹层内点击"重置"按钮可清空当前值。
          </p>
          <ColorPicker v-model="clearableColor" label="可重置颜色" />
          <p class="text-xs text-(--text-color-tertiary) break-all">
            当前值: {{ clearableColor ?? "空" }}
          </p>
        </div>
      </UCard>

      <!-- 6. 禁用 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">禁用</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            disabled=true 时禁止触发选择。
          </p>
          <ColorPicker v-model="disabledColor" disabled label="禁用颜色" />
          <p class="text-xs text-(--text-color-tertiary) break-all">
            当前值: {{ disabledColor ?? "空" }}
          </p>
        </div>
      </UCard>

      <!-- 7. 尺寸 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">不同尺寸</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            size 控制触发器按钮尺寸。
          </p>
          <div class="flex items-center gap-2 flex-wrap">
            <ColorPicker v-model="xsColor" size="xs" label="XS" />
            <ColorPicker v-model="lgColor" size="lg" label="LG" />
          </div>
          <p class="text-xs text-(--text-color-tertiary) break-all">
            XS: {{ xsColor ?? "空" }} | LG: {{ lgColor ?? "空" }}
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
