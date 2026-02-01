<script setup lang="ts">
import type { Task, ScheduledTask } from "@/apis/admin/models";
import { useNotification } from "@/composables/useNotification";
import { getTasks, runTask } from "@/apis/admin";

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
      title: "任务执行成功",
      description: name
    });
  } catch (error) {
    $notify.error({
      title: "任务执行失败",
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
      <template #header> 任务列表 </template>

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
            label="运行"
            size="xs"
            color="primary"
            variant="soft"
            icon="ep:caret-right"
            :loading="item.running"
            @click="handleRunTask(item.name)"
          />
        </div>
      </div>
      <div v-else class="text-sm text-gray-500"> 暂无任务 </div>
    </UCard>

    <UCard>
      <template #header> 定时任务 </template>

      <div v-if="scheduledTasks.length" class="space-y-2">
        <div v-for="item in scheduledTasks" :key="item.cron" class="px-3 py-2 rounded bg-white/5">
          <div class="font-mono text-xs text-gray-400">
            {{ item.cron }}
          </div>
          <div class="mt-1 text-xs truncate">
            <span class="text-gray-500"> 任务: </span>
            {{ item.tasks.join(", ") }}
          </div>
        </div>
      </div>
      <div v-else class="text-sm text-gray-500"> 暂无定时任务 </div>
    </UCard>
  </div>
</template>
