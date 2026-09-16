<script setup lang="ts">
import type { HitokotoFormModalResult } from "#shared/types/ly-editor";
import type { HitokotoForm, HitokotoItem, HitokotoTypeSelectOption } from "#shared/types/hitokoto";
import type { FormSubmitEvent } from "@nuxt/ui";
import { getHitokotoTypeOptions, createHitokoto, updateHitokoto } from "@/apis/hitokoto";
import { BasicModal } from "@/components/basic-modal";
import { useForm } from "@/composables/useForm";
import { computed, watch } from "vue";
import { z } from "zod";

const { t } = useI18n();
const $notify = useNotification();

const open = defineModel<boolean>("open", {
  default: false
});

const props = defineProps({
  mode: {
    type: String as PropType<"create" | "update">,
    default: "create"
  },
  record: {
    type: Object as PropType<HitokotoItem | undefined>,
    default: undefined
  }
});

const emits = defineEmits<{
  close: [result: HitokotoFormModalResult];
}>();

const schema = z.object({
  id: z.number().optional(),
  type: z.coerce.number().optional(),
  source: z.string().optional(),
  author: z.string().optional(),
  content: z
    .string({
      message: t("components.lyEditor.modules.hitokoto.form.validation.contentRequired")
    })
    .min(1, t("components.lyEditor.modules.hitokoto.form.validation.contentRequired"))
});

const { formData, formState, resetForm, setForm } = useForm<HitokotoForm>({
  id: undefined,
  type: undefined,
  source: undefined,
  author: undefined,
  content: undefined
});

const modalTitle = computed(() => {
  return props.mode === "update"
    ? t("components.lyEditor.modules.hitokoto.form.editTitle")
    : t("components.lyEditor.modules.hitokoto.form.addTitle");
});

watch(
  open,
  (newVal) => {
    if (!newVal) return;

    resetForm();

    if (props.record) {
      const { id, type, source, author, content } = props.record;
      setForm({ id, type, source, author, content });
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
      await updateHitokoto({ id: event.data.id, ...event.data });

      $notify.success({
        title: t("message.update.success")
      });
    } else {
      await createHitokoto({ ...event.data });

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

const hitokotoTypeOptions = ref<HitokotoTypeSelectOption[]>([]);

onMounted(async () => {
  hitokotoTypeOptions.value = await getHitokotoTypeOptions();
});
</script>
<template>
  <BasicModal
    v-model:open="open"
    :title="modalTitle"
    :submitting="formState.submitting"
    @cancel="handleCancel"
    @confirm="handleConfirm"
  >
    <UForm
      ref="formRef"
      :schema="schema"
      :state="formData"
      :validate-on-input-delay="100"
      @submit="handleSubmit"
    >
      <UFormField name="type" :label="t('components.lyEditor.modules.hitokoto.form.typeLabel')">
        <USelect
          v-model="formData.type"
          value-key="id"
          label-key="name"
          :placeholder="t('components.lyEditor.modules.hitokoto.form.typePlaceholder')"
          :items="hitokotoTypeOptions"
        />
      </UFormField>
      <UFormField name="source" :label="t('components.lyEditor.modules.hitokoto.form.sourceLabel')">
        <UInput
          v-model="formData.source"
          :placeholder="t('components.lyEditor.modules.hitokoto.form.sourcePlaceholder')"
        />
      </UFormField>
      <UFormField name="author" :label="t('components.lyEditor.modules.hitokoto.form.authorLabel')">
        <UInput
          v-model="formData.author"
          :placeholder="t('components.lyEditor.modules.hitokoto.form.authorPlaceholder')"
        />
      </UFormField>
      <UFormField
        name="content"
        :label="t('components.lyEditor.modules.hitokoto.form.contentLabel')"
        required
      >
        <UTextarea
          v-model="formData.content"
          :placeholder="t('components.lyEditor.modules.hitokoto.form.contentPlaceholder')"
        />
      </UFormField>
    </UForm>

    <template #footer>
      <UButton
        color="neutral"
        variant="outline"
        :disabled="formState.submitting"
        @click="handleCancel"
      >
        {{ t("common.cancel") }}
      </UButton>
      <UButton color="primary" :loading="formState.submitting" @click="handleConfirm">
        {{ t("common.confirm") }}
      </UButton>
    </template>
  </BasicModal>
</template>
