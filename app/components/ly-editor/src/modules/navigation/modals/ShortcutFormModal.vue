<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { ShortcutItem, ShortcutForm } from "#shared/types/navigation-website";
import { createShortcut, updateShortcut } from "~/apis/navigation-website";
import { SelectIcon } from "~/components/form/select";
import { BasicModal } from "@/components/basic-modal";
import { useForm } from "~/composables/useForm";
import { computed, watch } from "vue";
import { z } from "zod";

const { t } = useI18n();
const $notify = useNotification();

const open = defineModel<boolean>("open", {
  default: false
});

const props = defineProps({
  record: {
    type: Object as PropType<ShortcutItem | undefined>,
    default: undefined
  }
});

const emits = defineEmits<{
  close: [
    result:
      | {
          action: "submitted";
        }
      | {
          action: "cancelled";
        }
  ];
}>();

const schema = z.object({
  id: z.number().optional(),
  name: z
    .string({
      message: t("components.lyEditor.modules.navigation.shortcutForm.validation.nameRequired")
    })
    .min(1, t("components.lyEditor.modules.navigation.shortcutForm.validation.nameRequired")),
  url: z.url(t("components.lyEditor.modules.navigation.shortcutForm.validation.urlInvalid")),
  icon: z
    .string({
      message: t("components.lyEditor.modules.navigation.shortcutForm.validation.iconRequired")
    })
    .min(1, t("components.lyEditor.modules.navigation.shortcutForm.validation.iconRequired")),
  description: z.string().optional(),
  is_public: z.boolean().default(true),
  status: z.number().int().default(1)
});

const { formData, formState, resetForm, setForm } = useForm<ShortcutForm>({
  description: "",
  is_public: true,
  status: 1
});

const title = computed(() =>
  formData.id
    ? t("components.lyEditor.modules.navigation.shortcutForm.editTitle")
    : t("components.lyEditor.modules.navigation.shortcutForm.createTitle")
);

/** 状态选项 */
const statusItems = computed(() => [
  { label: t("components.lyEditor.common.status.enabled"), value: 1 },
  { label: t("components.lyEditor.common.status.disabled"), value: 2 }
]);

// 监听弹窗显示，初始化表单与回填数据
watch(
  open,
  (newVal) => {
    if (!newVal) return;

    resetForm();

    if (props.record) {
      setForm(props.record);
    }
  },
  {
    immediate: true
  }
);

const formRef = useTemplateRef("formRef");

const handleSubmit = async (event: FormSubmitEvent<z.output<typeof schema>>) => {
  try {
    formState.submitting = true;

    if (event.data.id) {
      await updateShortcut({
        id: event.data.id,
        name: event.data.name,
        url: event.data.url,
        icon: event.data.icon,
        description: event.data.description,
        is_public: event.data.is_public,
        status: event.data.status
      });

      $notify.success({
        title: t("message.edit.success")
      });
    } else {
      await createShortcut({
        name: event.data.name,
        url: event.data.url,
        icon: event.data.icon,
        description: event.data.description,
        is_public: event.data.is_public,
        status: event.data.status
      });

      $notify.success({
        title: t("message.add.success")
      });
    }

    open.value = false;

    emits("close", {
      action: "submitted"
    });
  } catch (error) {
    $notify.error({
      title: t("message.operate.error"),
      error
    });
  } finally {
    formState.submitting = false;
  }
};

const handleConfirm = async () => {
  formRef.value?.submit();
};

const handleCancel = () => {
  open.value = false;
  emits("close", {
    action: "cancelled"
  });
};
</script>
<template>
  <BasicModal
    v-model:open="open"
    :title="title"
    :submitting="formState.submitting"
    @cancel="handleCancel"
    @confirm="handleConfirm"
  >
    <UForm
      ref="formRef"
      class="space-y-2"
      :schema="schema"
      :state="formData"
      :validate-on-input-delay="100"
      @submit="handleSubmit"
    >
      <UFormField
        name="name"
        :label="$t('components.lyEditor.modules.navigation.shortcutForm.nameLabel')"
        required
      >
        <UInput
          v-model="formData.name"
          :placeholder="$t('components.lyEditor.modules.navigation.shortcutForm.namePlaceholder')"
        />
      </UFormField>

      <UFormField
        name="url"
        :label="$t('components.lyEditor.modules.navigation.shortcutForm.urlLabel')"
        required
      >
        <UInput
          v-model="formData.url"
          :placeholder="$t('components.lyEditor.modules.navigation.shortcutForm.urlPlaceholder')"
        />
      </UFormField>

      <UFormField
        name="icon"
        :label="$t('components.lyEditor.modules.navigation.shortcutForm.iconLabel')"
        required
      >
        <SelectIcon
          v-model="formData.icon"
          :placeholder="$t('components.lyEditor.modules.navigation.shortcutForm.iconPlaceholder')"
        />
      </UFormField>

      <UFormField
        name="description"
        :label="$t('components.lyEditor.modules.navigation.shortcutForm.descriptionLabel')"
      >
        <UTextarea
          v-model="formData.description"
          :placeholder="
            $t('components.lyEditor.modules.navigation.shortcutForm.descriptionPlaceholder')
          "
        />
      </UFormField>

      <UFormField
        name="is_public"
        :label="$t('components.lyEditor.modules.navigation.shortcutForm.publicLabel')"
      >
        <USwitch v-model="formData.is_public" />
      </UFormField>

      <UFormField
        name="status"
        :label="$t('components.lyEditor.modules.navigation.shortcutForm.statusLabel')"
      >
        <USelect v-model="formData.status" :items="statusItems" />
      </UFormField>
    </UForm>
  </BasicModal>
</template>
