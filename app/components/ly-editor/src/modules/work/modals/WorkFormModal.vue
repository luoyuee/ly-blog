<script setup lang="ts">
import type { WorkForm } from "#shared/types/config";
import type { WorkFormModalPayload, WorkFormModalResult } from "#shared/types/ly-editor";
import { EmojiOptions } from "#shared/constants/emoji";
import type { FormSubmitEvent, SelectMenuItem } from "@nuxt/ui";
import { updateWorkConfig } from "@/apis/config";
import { BasicModal } from "@/components/basic-modal";
import { ImageSelect } from "@/components/image";
import { useForm } from "@/composables/useForm";
import { computed, watch } from "vue";
import { z } from "zod";

const $notify = useNotification();

const visible = defineModel<boolean>("visible", {
  default: false
});

const props = defineProps({
  payload: {
    type: Object as PropType<WorkFormModalPayload>,
    default: () => ({
      mode: "create",
      record: undefined,
      works: []
    })
  }
});

const emits = defineEmits<{
  resolve: [result: WorkFormModalResult];
}>();

const schema = z.object({
  name: z.string({ message: "请输入项目名称" }).min(1, "请输入项目名称"),
  icon: z.string({ message: "请选择项目图标" }).min(1, "请选择项目图标"),
  description: z.string({ message: "请输入项目描述" }).min(1, "请输入项目描述"),
  image: z.string({ message: "请选择项目预览图" }).min(1, "请选择项目预览图"),
  languages: z.array(z.string({ message: "请选择项目语言" }).min(1, "请选择项目语言")),
  repoUrl: z.string({ message: "请输入项目仓库地址" }).min(1, "请输入项目仓库地址")
});

const { formData, formState, resetForm, setForm } = useForm<WorkForm>({
  name: undefined,
  icon: undefined,
  description: undefined,
  image: undefined,
  languages: [],
  repoUrl: undefined
});

const isEdit = computed(() => {
  return props.payload.mode === "update";
});

const modalTitle = computed(() => {
  return isEdit.value ? "修改信息" : "新建项目";
});

const workItems = computed(() => {
  return props.payload.works;
});

const originalRepoUrl = computed(() => {
  return props.payload.record?.repoUrl;
});

watch(
  visible,
  (newVal) => {
    if (!newVal) return;

    resetForm();

    if (props.payload.record) {
      const { name, icon, description, image, languages, repoUrl } = props.payload.record;
      setForm({
        name,
        icon,
        description,
        image,
        languages,
        repoUrl
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

    if (isEdit.value) {
      const duplicatedItem = workItems.value.find((item) => {
        return item.repoUrl === event.data.repoUrl && item.repoUrl !== originalRepoUrl.value;
      });

      if (duplicatedItem) {
        $notify.error({
          title: "项目已存在"
        });
        return;
      }

      const data = workItems.value.map((item) => {
        if (item.repoUrl === originalRepoUrl.value) {
          return {
            ...item,
            name: event.data.name,
            icon: event.data.icon,
            description: event.data.description,
            image: event.data.image,
            languages: event.data.languages
          };
        }

        return item;
      });

      await updateWorkConfig(data);

      $notify.success({
        title: "修改成功"
      });
    } else {
      const isExist = workItems.value.some((item) => item.repoUrl === event.data.repoUrl);

      if (isExist) {
        $notify.error({
          title: "项目已存在"
        });
        return;
      }

      await updateWorkConfig([
        ...workItems.value,
        {
          name: event.data.name,
          icon: event.data.icon,
          description: event.data.description,
          repoUrl: event.data.repoUrl,
          languages: event.data.languages,
          image: event.data.image
        }
      ]);

      $notify.success({
        title: "创建成功"
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

const emojiItems = computed<SelectMenuItem[]>(() => {
  return EmojiOptions.map((item) => ({
    label: `${item.font} ${item.name}`,
    value: item.font
  }));
});
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
      class="space-y-2"
      :schema="schema"
      :state="formData"
      :validate-on-input-delay="100"
      @submit="handleSubmit"
    >
      <UFormField name="name" label="项目名称" required>
        <UInput v-model="formData.name" placeholder="请输入项目名称" />
      </UFormField>

      <UFormField name="icon" label="项目图标">
        <USelectMenu
          v-model="formData.icon"
          :items="emojiItems"
          class="w-full"
          value-key="value"
          virtualize
          clear
        />
      </UFormField>

      <UFormField name="repoUrl" label="仓库链接">
        <UInput v-model="formData.repoUrl" placeholder="请输入仓库链接" icon="custom:github" />
      </UFormField>

      <UFormField name="description" label="项目描述">
        <UTextarea v-model="formData.description" placeholder="请输入项目描述" />
      </UFormField>

      <UFormField name="languages" label="项目语言">
        <UInputTags v-model="formData.languages" placeholder="请输入项目语言" />
      </UFormField>

      <UFormField name="image" label="项目图片">
        <ImageSelect v-model="formData.image" />
      </UFormField>
    </UForm>
  </BasicModal>
</template>
