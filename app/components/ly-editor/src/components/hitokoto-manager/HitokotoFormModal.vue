<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { HitokotoItem, HitokotoForm, HitokotoTypeSelectOption } from "#shared/types/hitokoto";
import { reactive } from "vue";
import { getHitokotoTypeOptions, createHitokoto, updateHitokoto } from "@/apis/hitokoto";
import { BasicModal } from "@/components/basic-modal";
import { z } from "zod";

const $notify = useNotification();

const emits = defineEmits(["cancel", "submit"]);

const schema = z.object({
  id: z.number().optional(),
  type: z.coerce.number().optional(),
  source: z.string().optional(),
  author: z.string().optional(),
  content: z.string({ message: "请输入内容" }).min(1, "请输入内容")
});

const formData = reactive<HitokotoForm>({
  content: undefined
});

const resetForm = () => {
  Object.keys(formData).forEach((key) => {
    formData[key as keyof HitokotoForm] = undefined;
  });
};

const visible = ref(false);

const handleOpen = (data?: HitokotoItem) => {
  resetForm();

  if (data) {
    formData.id = data.id;
    formData.type = data.type;
    formData.source = data.source;
    formData.author = data.author;
    formData.content = data.content;
  }

  visible.value = true;
};

defineExpose({
  open: handleOpen
});

const submitting = ref(false);
const formRef = useTemplateRef("formRef");
const handleSubmit = async (event: FormSubmitEvent<z.output<typeof schema>>) => {
  try {
    submitting.value = true;

    if (event.data.id) {
      await updateHitokoto({ id: event.data.id, ...event.data });

      $notify.success({
        title: "修改成功"
      });
    } else {
      await createHitokoto({ ...event.data });

      $notify.success({
        title: "添加成功"
      });
    }

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

const handleConfirm = async () => {
  formRef.value?.submit();
};

const handleCancel = () => {
  visible.value = false;
  emits("cancel");
};

const hitokotoTypeOptions = ref<HitokotoTypeSelectOption[]>([]);

onMounted(async () => {
  hitokotoTypeOptions.value = await getHitokotoTypeOptions();
});
</script>
<template>
  <BasicModal
    v-model:visible="visible"
    :title="formData.id ? '修改语句' : '添加语句'"
    :submitting="submitting"
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
      <UFormField name="type" label="语句分类">
        <USelect
          v-model="formData.type"
          value-key="id"
          label-key="name"
          placeholder="请选择语句分类"
          :items="hitokotoTypeOptions"
        />
      </UFormField>
      <UFormField name="source" label="语句来源">
        <UInput v-model="formData.source" placeholder="请输入语句来源" />
      </UFormField>
      <UFormField name="author" label="语句作者">
        <UInput v-model="formData.author" placeholder="请输入语句作者" />
      </UFormField>
      <UFormField name="content" label="语句内容" required>
        <UTextarea v-model="formData.content" placeholder="请输入语句内容" />
      </UFormField>
    </UForm>

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
