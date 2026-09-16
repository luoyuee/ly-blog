<script setup lang="ts">
import type { NoticeConfig } from "#shared/types/config";
import { updateNoticeConfig, getNoticeConfig } from "@/apis/config";
import { BasicModal } from "@/components/basic-modal";
import { watch } from "vue";
import { z } from "zod";

const { t } = useI18n();

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

const open = defineModel<boolean>("open", {
  default: false
});

const emits = defineEmits<{
  close: [result: { action: "saved" } | { action: "cancelled" }];
}>();

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

// 监听弹窗显示，加载公告配置
watch(
  open,
  async (newVal) => {
    if (!newVal) return;

    formData.value = await getNoticeConfig();
  },
  { immediate: true }
);

const submitting = ref(false);

const handleConfirm = async () => {
  const { error, data } = schema.safeParse(formData.value);

  if (error) {
    $notify.error({
      title: t("message.operate.error"),
      error
    });
    return;
  }

  try {
    submitting.value = true;

    await updateNoticeConfig(data);

    $notify.success({
      title: t("message.save.success")
    });

    open.value = false;
    emits("close", { action: "saved" });
  } catch (error) {
    $notify.error({
      title: t("message.operate.error"),
      error
    });
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  open.value = false;
  emits("close", { action: "cancelled" });
};

const tabItems = computed(() => [
  { label: t("components.lyEditor.modules.notice.tabs.card"), slot: "card" },
  { label: t("components.lyEditor.modules.notice.tabs.toast"), slot: "toast" },
  { label: t("components.lyEditor.modules.notice.tabs.modal"), slot: "modal" }
]);

const positionItems = computed(() => [
  { label: t("components.lyEditor.modules.notice.positions.topLeft"), value: "top-left" },
  { label: t("components.lyEditor.modules.notice.positions.topCenter"), value: "top-center" },
  { label: t("components.lyEditor.modules.notice.positions.topRight"), value: "top-right" },
  { label: t("components.lyEditor.modules.notice.positions.bottomLeft"), value: "bottom-left" },
  { label: t("components.lyEditor.modules.notice.positions.bottomCenter"), value: "bottom-center" },
  { label: t("components.lyEditor.modules.notice.positions.bottomRight"), value: "bottom-right" }
]);

const fullscreenItems = computed(() => [
  { label: t("components.lyEditor.modules.notice.toggleOn"), value: true },
  { label: t("components.lyEditor.modules.notice.toggleOff"), value: false }
]);
</script>
<template>
  <BasicModal
    v-model:open="open"
    :title="$t('components.lyEditor.modules.notice.settingsTitle')"
    :submitting="submitting"
    @cancel="handleCancel"
    @confirm="handleConfirm"
  >
    <UTabs :items="tabItems">
      <template #card>
        <UForm :state="formData.card" class="flex flex-col gap-4">
          <UFormField
            :label="$t('components.lyEditor.modules.notice.contentLabel')"
            name="content"
            :description="$t('components.lyEditor.modules.notice.contentDescription')"
          >
            <UTextarea v-model="formData.card.content" :rows="12" />
          </UFormField>
        </UForm>
      </template>

      <template #toast>
        <UForm :state="formData.toast" class="flex flex-col gap-4">
          <UFormField :label="$t('components.lyEditor.modules.notice.contentLabel')" name="content">
            <UTextarea v-model="formData.toast.content" :rows="4" />
          </UFormField>
          <UFormField :label="$t('components.lyEditor.modules.notice.delayLabel')" name="delay">
            <UInputNumber v-model="formData.toast.delay" :min="0" :step="100" class="w-full" />
          </UFormField>
          <UFormField
            :label="$t('components.lyEditor.modules.notice.positionLabel')"
            name="position"
          >
            <URadioGroup
              v-model="formData.toast.position"
              variant="card"
              orientation="horizontal"
              size="xs"
              :ui="{ fieldset: 'flex-wrap', item: 'mb-2' }"
              :items="positionItems"
            />
          </UFormField>
        </UForm>
      </template>

      <template #modal>
        <UForm :state="formData.modal" class="flex flex-col gap-4">
          <UFormField :label="$t('components.lyEditor.modules.notice.contentLabel')" name="content">
            <UTextarea v-model="formData.modal.content" :rows="4" />
          </UFormField>
          <UFormField :label="$t('components.lyEditor.modules.notice.delayLabel')" name="delay">
            <UInputNumber v-model="formData.modal.delay" :min="0" :step="100" class="w-full" />
          </UFormField>
          <UFormField
            :label="$t('components.lyEditor.modules.notice.fullscreenLabel')"
            name="fullscreen"
          >
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
  </BasicModal>
</template>
