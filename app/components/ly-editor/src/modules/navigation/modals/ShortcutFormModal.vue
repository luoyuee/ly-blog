<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { ShortcutItem, ShortcutForm } from "#shared/types/navigation-website";
import { createShortcut, updateShortcut } from "~/apis/navigation-website";
import { SelectIcon } from "~/components/form/select";
import { BasicModal } from "@/components/basic-modal";
import { useForm } from "~/composables/useForm";
import { lyEditorEmitter } from "~/events";
import { z } from "zod";

const $notify = useNotification();

const props = defineProps<{
  open?: boolean;
  payload?: ShortcutItem;
}>();

const emits = defineEmits<{
  resolve: [
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
  name: z.string({ message: "请输入名称" }).min(1, "请输入名称"),
  url: z.url("请输入有效的URL地址"),
  icon: z.string({ message: "请输入图标" }).min(1, "请输入图标"),
  description: z.string().optional(),
  is_public: z.boolean().default(true),
  status: z.number().int().default(1)
});

const { formData, formState, resetForm, setForm } = useForm<ShortcutForm>({
  description: "",
  is_public: true,
  status: 1
});

const visible = ref(false);

const title = computed(() => (formData.id ? "编辑快捷方式" : "新增快捷方式"));

const handleOpen = (data?: ShortcutItem) => {
  resetForm();

  if (data) {
    setForm(data);
  }

  visible.value = true;
};

lyEditorEmitter.on("cmd.modal-manager:open:shortcut-form", handleOpen);

watch(
  () => props.open,
  (open) => {
    if (open) {
      handleOpen(props.payload);
    } else {
      visible.value = false;
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
        title: "修改成功"
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
        title: "添加成功"
      });
    }

    visible.value = false;

    lyEditorEmitter.emit("notify.shortcut-form:submitted");
    emits("resolve", {
      action: "submitted"
    });
  } catch (error) {
    $notify.error({
      title: "操作失败",
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
  visible.value = false;
  lyEditorEmitter.emit("state.shortcut-form:cancel");
  emits("resolve", {
    action: "cancelled"
  });
};
</script>
<template>
  <BasicModal
    v-model:visible="visible"
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
      <UFormField name="name" label="名称" required>
        <UInput v-model="formData.name" placeholder="如：GitHub" />
      </UFormField>

      <UFormField name="url" label="链接地址" required>
        <UInput v-model="formData.url" placeholder="如 https://github.com" />
      </UFormField>

      <UFormField name="icon" label="图标" required>
        <SelectIcon v-model="formData.icon" placeholder="请选择图标" />
      </UFormField>

      <UFormField name="description" label="描述">
        <UTextarea v-model="formData.description" placeholder="快捷方式描述（可选）" />
      </UFormField>

      <UFormField name="is_public" label="公开">
        <USwitch v-model="formData.is_public" />
      </UFormField>

      <UFormField name="status" label="状态">
        <USelect
          v-model="formData.status"
          :items="[
            { label: '启用', value: 1 },
            { label: '禁用', value: 2 }
          ]"
        />
      </UFormField>
    </UForm>
  </BasicModal>
</template>
