<script setup lang="ts">
import type { NoticeConfig } from "#shared/types/config";
import { updateNoticeConfig, getNoticeConfig } from "@/apis/config";
import { BasicModal } from "@/components/basic-modal";
import { z } from "zod";

const schema = z.object({
  card: z.object({
    content: z.string()
  }),
  toast: z.object({
    content: z.string(),
    delay: z.number(),
    position: z.string()
  }),
  modal: z.object({
    content: z.string(),
    delay: z.number(),
    fullscreen: z.boolean()
  })
});

const $notify = useNotification();

const emits = defineEmits(["cancel", "submit"]);

const formData = ref<NoticeConfig>({
  card: {
    content: ""
  },
  toast: {
    content: "",
    delay: 3000,
    position: "top-right"
  },
  modal: {
    content: "",
    delay: 3000,
    fullscreen: false
  }
});

const visible = ref(false);

const handleOpen = () => {
  visible.value = true;

  getNoticeConfig().then((res) => {
    formData.value = res;
  });
};

defineExpose({
  open: handleOpen
});

const submitting = ref(false);

const handleConfirm = async () => {
  const { error, data } = schema.safeParse(formData.value);

  if (error) {
    $notify.error({
      title: "操作失败",
      error
    });
    return;
  }

  try {
    submitting.value = true;

    await updateNoticeConfig(data);

    $notify.success({
      title: "保存成功"
    });

    visible.value = false;

    emits("submit");
  } catch (error) {
    $notify.error({
      title: "操作失败",
      error
    });
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  visible.value = false;
  emits("cancel");
};

const tabItems = [
  {
    label: "卡片",
    slot: "card"
  },
  {
    label: "提示",
    slot: "toast"
  },
  {
    label: "弹窗",
    slot: "modal"
  }
];

const positionItems = [
  {
    label: "左上角",
    value: "top-left"
  },
  {
    label: "顶部居中",
    value: "top-center"
  },
  {
    label: "右上角",
    value: "top-right"
  },
  {
    label: "左下角",
    value: "bottom-left"
  },
  {
    label: "底部居中",
    value: "bottom-center"
  },
  {
    label: "右下角",
    value: "bottom-right"
  }
];

const fullscreenItems = [
  {
    label: "开启",
    value: true
  },
  {
    label: "关闭",
    value: false
  }
];
</script>
<template>
  <BasicModal v-model:visible="visible" title="公告设置">
    <UTabs :items="tabItems">
      <template #card>
        <UForm :state="formData.card" class="flex flex-col gap-4">
          <UFormField label="公告内容" name="content" description="博客公告将显示在网页右侧">
            <UTextarea v-model="formData.card.content" :rows="12" />
          </UFormField>
        </UForm>
      </template>

      <template #toast>
        <UForm :state="formData.toast" class="flex flex-col gap-4">
          <UFormField label="公告内容" name="content">
            <UTextarea v-model="formData.toast.content" :rows="4" />
          </UFormField>

          <UFormField label="弹出延迟（毫秒）" name="delay">
            <UInputNumber v-model="formData.toast.delay" :min="0" :step="100" class="w-full" />
          </UFormField>

          <UFormField label="弹出位置" name="position">
            <URadioGroup
              v-model="formData.toast.position"
              variant="card"
              orientation="horizontal"
              size="xs"
              :ui="{
                fieldset: 'flex-wrap',
                item: 'mb-2'
              }"
              :items="positionItems"
            />
          </UFormField>
        </UForm>
      </template>

      <template #modal>
        <UForm :state="formData.modal" class="flex flex-col gap-4">
          <UFormField label="公告内容" name="content">
            <UTextarea v-model="formData.modal.content" :rows="4" />
          </UFormField>

          <UFormField label="弹出延迟（毫秒）" name="delay">
            <UInputNumber v-model="formData.modal.delay" :min="0" :step="100" class="w-full" />
          </UFormField>

          <UFormField label="是否全屏" name="fullscreen">
            <URadioGroup
              v-model="formData.modal.fullscreen"
              variant="table"
              orientation="horizontal"
              size="xs"
              :items="fullscreenItems"
            />
          </UFormField>
        </UForm>
      </template>
    </UTabs>

    <template #footer>
      <UButton
        label="取消"
        color="neutral"
        variant="outline"
        :disabled="submitting"
        @click="handleCancel"
      />
      <UButton label="确认" color="primary" :loading="submitting" @click="handleConfirm" />
    </template>
  </BasicModal>
</template>
