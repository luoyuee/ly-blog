<script setup lang="ts">
import type { Task, ScheduledTask } from "@/apis/admin/models";
import { useNotification } from "@/composables/useNotification";
import { getTasks, runTask } from "@/apis/admin";

const { t } = useI18n();

const tasks = ref<(Task & { running?: boolean })[]>([]);
const scheduledTasks = ref<ScheduledTask[]>([]);

const $notify = useNotification();

const loadTasks = async () => {
  const res = await getTasks();
  tasks.value = res.tasks;
  scheduledTasks.value = res.scheduledTasks;
};

onMounted(() => {
  loadTasks();
});

const handleRunTask = async (name: string) => {
  const task = tasks.value.find((item) => item.name === name);
  if (!task) return;
  if (task.running) return;

  try {
    task.running = true;

    await runTask(name);

    $notify.success({
      title: t("components.lyEditor.modules.cron.executeSuccess"),
      description: name
    });
  } catch (error) {
    $notify.error({
      title: t("components.lyEditor.modules.cron.executeFailed"),
      error
    });
  } finally {
    task.running = false;
  }
};
</script>
<template>
  <div class="space-y-4 h-full p-4 overflow-y-auto slim-scrollbar">
    <UCard>
      <template #header> {{ $t("components.lyEditor.modules.cron.listHeader") }} </template>

      <div v-if="tasks.length" class="space-y-2">
        <div
          v-for="item in tasks"
          :key="item.name"
          class="flex items-center justify-between px-3 py-2 rounded bg-white/5"
        >
          <div class="flex-1">
            <div class="font-medium truncate">
              {{ item.name }}
            </div>
            <div class="mt-1 text-xs text-gray-500 truncate">
              {{ item.description }}
            </div>
          </div>

          <UButton
            :label="$t('components.lyEditor.modules.cron.run')"
            size="xs"
            color="primary"
            variant="soft"
            icon="lucide:play"
            :loading="item.running"
            @click="handleRunTask(item.name)"
          />
        </div>
      </div>
      <div v-else class="text-sm text-gray-500">
        {{ $t("components.lyEditor.modules.cron.noTask") }}
      </div>
    </UCard>

    <UCard>
      <template #header> {{ $t("components.lyEditor.modules.cron.jobHeader") }} </template>

      <div v-if="scheduledTasks.length" class="space-y-2">
        <div v-for="item in scheduledTasks" :key="item.cron" class="px-3 py-2 rounded bg-white/5">
          <div class="font-mono text-xs text-gray-400">
            {{ item.cron }}
          </div>
          <div class="mt-1 text-xs truncate">
            <span class="text-gray-500">
              {{ $t("components.lyEditor.modules.cron.jobLabel") }}</span
            >
            {{ item.tasks.join(", ") }}
          </div>
        </div>
      </div>
      <div v-else class="text-sm text-gray-500">
        {{ $t("components.lyEditor.modules.cron.noJob") }}
      </div>
    </UCard>
  </div>
</template>
