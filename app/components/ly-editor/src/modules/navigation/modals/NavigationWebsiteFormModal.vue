<script setup lang="ts">
import type { NavigationWebsiteFormModalPayload, NavigationWebsiteFormModalResult } from "#shared/types/ly-editor";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { NavigationWebsiteForm } from "#shared/types/navigation-website";
import { createNavigationWebsite, updateNavigationWebsite } from "@/apis/navigation-website";
import { BasicModal } from "@/components/basic-modal";
import { useForm } from "~/composables/useForm";
import { computed, watch } from "vue";
import { z } from "zod";

const $notify = useNotification();

const visible = defineModel<boolean>("visible", {
  default: false
});

const props = defineProps({
  payload: {
    type: Object as PropType<NavigationWebsiteFormModalPayload>,
    default: () => ({
      mode: "create",
      record: undefined
    })
  }
});

const emits = defineEmits<{
  resolve: [result: NavigationWebsiteFormModalResult];
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

const { formData, formState, resetForm, setForm } = useForm<NavigationWebsiteForm>({
  id: undefined,
  name: undefined,
  url: undefined,
  icon: undefined,
  tags: undefined,
  description: undefined,
  type: 1,
  hot: 0,
  is_favorite: false,
  is_public: true,
  status: 1
});

const modalTitle = computed(() => {
  return props.payload.mode === "update" ? "编辑网站" : "新增网站";
});

watch(
  visible,
  (newVal) => {
    if (!newVal) return;

    resetForm();

    if (props.payload.record) {
      const {
        id,
        name,
        url,
        icon,
        tags,
        description,
        type,
        hot,
        is_favorite,
        is_public,
        status
      } = props.payload.record;

      setForm({
        id,
        name,
        url,
        icon,
        tags,
        description,
        type,
        hot,
        is_favorite,
        is_public,
        status
      });
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
  emits("resolve", {
    action: "cancelled"
  });
};
</script>
<template>
  <BasicModal
    v-model:visible="visible"
    :title="modalTitle"
    :submitting="formState.submitting"
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
        :disabled="formState.submitting"
        @click="handleCancel"
      />
      <UButton label="确认" color="primary" :loading="formState.submitting" @click="handleConfirm" />
    </template>
  </BasicModal>
</template>
