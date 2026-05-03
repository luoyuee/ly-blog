<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type {
  NavigationWebsiteItem,
  NavigationWebsiteForm
} from "#shared/types/navigation-website";
import { createNavigationWebsite, updateNavigationWebsite } from "@/apis/navigation-website";
import { BasicModal } from "@/components/basic-modal";
import { useForm } from "~/composables/useForm";
import { lyEditorEmitter } from "~/events";
import { z } from "zod";

const $notify = useNotification();

const props = defineProps<{
  open?: boolean;
  payload?: NavigationWebsiteItem;
}>();

const emits = defineEmits<{
  cancel: [];
  submit: [];
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
  name: z.string({ message: "请输入网站名称" }).min(1, "请输入网站名称"),
  url: z.url("请输入有效的URL地址"),
  icon: z.url("请输入有效的图标URL地址").optional(),
  tags: z.array(z.string()).optional().nullable(),
  description: z.string().optional(),
  type: z.number().int().default(1),
  hot: z.number().int().default(0),
  is_favorite: z.boolean().default(false),
  is_public: z.boolean().default(true),
  status: z.number().int().default(1)
});

const { formData, resetForm, setForm } = useForm<NavigationWebsiteForm>({
  type: 1,
  hot: 0,
  is_favorite: false,
  is_public: true,
  status: 1
});

const visible = ref(false);

const handleOpen = (data?: NavigationWebsiteItem) => {
  resetForm();

  if (data) {
    setForm(data);
  }

  visible.value = true;
};

lyEditorEmitter.on("cmd.modal-manager:open:navigation-website-form", handleOpen);

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

const submitting = ref(false);
const formRef = useTemplateRef("formRef");

const handleSubmit = async (event: FormSubmitEvent<z.output<typeof schema>>) => {
  try {
    submitting.value = true;

    if (event.data.id) {
      await updateNavigationWebsite({
        id: event.data.id,
        name: event.data.name,
        url: event.data.url,
        icon: event.data.icon,
        tags: event.data.tags,
        description: event.data.description,
        type: event.data.type,
        hot: event.data.hot,
        is_favorite: event.data.is_favorite,
        is_public: event.data.is_public,
        status: event.data.status
      });

      $notify.success({
        title: "修改成功"
      });
    } else {
      await createNavigationWebsite({
        name: event.data.name,
        url: event.data.url,
        icon: event.data.icon,
        tags: event.data.tags,
        description: event.data.description,
        type: event.data.type,
        hot: event.data.hot,
        is_favorite: event.data.is_favorite,
        is_public: event.data.is_public,
        status: event.data.status
      });

      $notify.success({
        title: "添加成功"
      });
    }

    visible.value = false;

    lyEditorEmitter.emit("notify.navigation-website-form:submitted");
    emits("submit");
    emits("resolve", {
      action: "submitted"
    });
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
  lyEditorEmitter.emit("state.navigation-website-form:cancel");
  emits("resolve", {
    action: "cancelled"
  });
};
</script>
<template>
  <BasicModal
    v-model:visible="visible"
    :title="formData.id ? '编辑网站' : '新增网站'"
    :submitting="submitting"
    @cancel="handleCancel"
    @confirm="handleConfirm"
  >
    <UForm
      ref="formRef"
      class="space-y-4"
      :schema="schema"
      :state="formData"
      :validate-on-input-delay="100"
      @submit="handleSubmit"
    >
      <UFormField name="name" label="网站名称" required>
        <UInput v-model="formData.name" placeholder="请输入网站名称" />
      </UFormField>

      <UFormField name="url" label="网站地址" required>
        <UInput v-model="formData.url" placeholder="请输入网站地址，如 https://example.com" />
      </UFormField>

      <UFormField name="icon" label="图标">
        <UInput v-model="formData.icon" placeholder="请输入图标名称或URL" />
      </UFormField>

      <UFormField name="tags" label="标签">
        <UInputTags v-model="formData.tags" placeholder="回车添加标签，如：工具,搜索" />
      </UFormField>

      <UFormField name="description" label="描述">
        <UTextarea v-model="formData.description" placeholder="请输入网站描述" />
      </UFormField>

      <UFormField name="type" label="类型">
        <USelect
          v-model="formData.type"
          :items="[
            { label: '网站', value: 1 },
            { label: '书签', value: 2 }
          ]"
        />
      </UFormField>

      <UFormField name="hot" label="热度">
        <UInputNumber v-model="formData.hot" :min="0" placeholder="请输入热度，默认 0" />
      </UFormField>

      <UFormField name="is_favorite" label="收藏">
        <USwitch v-model="formData.is_favorite" />
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
