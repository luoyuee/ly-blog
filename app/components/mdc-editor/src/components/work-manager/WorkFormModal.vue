<script setup lang="ts">
import type { WorkItem, WorkForm } from "#shared/types/config";
import { EmojiOptions } from "#shared/constants/emoji";
import type { FormSubmitEvent, SelectMenuItem } from "@nuxt/ui";
import { updateWorkConfig } from "@/apis/config";
import { BasicModal } from "@/components/basic-modal";
import { z } from "zod";
import { ImageSelect } from "@/components/image";

const $notify = useNotification();

const props = defineProps({
  works: {
    type: Array as PropType<WorkItem[]>,
    default: () => []
  }
});

const emits = defineEmits(["cancel", "submit"]);

const schema = z.object({
  name: z.string({ message: "请输入项目名称" }).min(1, "请输入项目名称"),
  icon: z.string({ message: "请选择项目图标" }).min(1, "请选择项目图标"),
  description: z.string({ message: "请输入项目描述" }).min(1, "请输入项目描述"),
  image: z.string({ message: "请选择项目预览图" }).min(1, "请选择项目预览图"),
  languages: z.array(z.string({ message: "请选择项目语言" }).min(1, "请选择项目语言")),
  repoUrl: z.string({ message: "请输入项目仓库地址" }).min(1, "请输入项目仓库地址")
});

const formData = ref<WorkForm>({});

const resetForm = () => {
  formData.value = {};
};

const visible = ref(false);

const isEdit = ref(false);

const handleOpen = (data?: WorkItem) => {
  resetForm();

  isEdit.value = Boolean(data);

  formData.value = data || {};

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

    if (isEdit.value) {
      const data = props.works.map((item) => {
        if (item.repoUrl === event.data.repoUrl) {
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
      const isExist = props.works.some((item) => item.repoUrl === event.data.repoUrl);

      if (isExist) {
        $notify.error({
          title: "项目已存在"
        });
        return;
      }

      await updateWorkConfig([
        ...props.works,
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

const emojiItems = computed<SelectMenuItem[]>(() => {
  return EmojiOptions.map((item) => ({
    label: `${item.font} ${item.name}`,
    value: item.font
  }));
});
</script>
<template>
  <BasicModal v-model:visible="visible" :title="isEdit ? '修改信息' : '新建项目'">
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
