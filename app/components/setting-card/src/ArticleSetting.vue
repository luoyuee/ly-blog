<script setup lang="ts">
import type { IClientConfigArticle } from "@@/shared/types/config";
import type { FormSubmitEvent } from "@nuxt/ui";
import { BasicModal } from "@/components/basic-modal";
import { useForm } from "@/composables/useForm";
import { useConfigStore } from "@/stores";
import { cloneDeep } from "es-toolkit";
import { z } from "zod";
import SettingCard from "./SettingCard.vue";

const configStore = useConfigStore();

const createInitialFormData = (): IClientConfigArticle => {
  return cloneDeep(configStore.article);
};

const { formData, formState, isDirty, setForm, setInitial, resetForm } =
  useForm<IClientConfigArticle>(createInitialFormData());

const schema = z.object({
  comment_max_length: z
    .number()
    .int("评论长度必须为整数")
    .nonnegative("评论长度不能为负数")
    .optional(),
  payment_qr_code: z
    .array(
      z.object({
        name: z.string({ message: "请输入收款码名称" }).min(1, "请输入收款码名称"),
        image: z.string({ message: "请输入收款码图片链接" }).url("请输入合法的图片链接")
      })
    )
    .optional()
});

const syncFormData = () => {
  const nextFormData = createInitialFormData();
  setInitial(nextFormData);
  setForm(nextFormData);
};

const formRef = useTemplateRef("formRef");

/**
 * 触发主表单校验与保存
 */
const handleSave = () => {
  formRef.value?.submit();
};

/**
 * 文章设置表单提交处理
 */
const handleSubmit = async () => {
  formState.submitting = true;
  try {
    await configStore.update({
      article: cloneDeep(formData)
    });

    syncFormData();
  } finally {
    formState.submitting = false;
  }
};

const handleReset = () => {
  resetForm();
};

const modalState = reactive({
  visible: false
});

const modalFormData = reactive<{
  name: string;
  image: string;
}>({
  name: "",
  image: ""
});

const modalSchema = z.object({
  name: z.string({ message: "请输入收款码名称" }).min(1, "请输入收款码名称"),
  image: z.url({ message: "请输入合法的图片链接" })
});

const modalFormRef = useTemplateRef("modalFormRef");

const handleAddQr = () => {
  modalFormData.name = "";
  modalFormData.image = "";

  modalState.visible = true;
};

const handleModalSubmit = (event: FormSubmitEvent<z.output<typeof modalSchema>>) => {
  const { name, image } = event.data;

  if (formData.payment_qr_code) {
    formData.payment_qr_code.push({ name, image });
  } else {
    formData.payment_qr_code = [{ name, image }];
  }

  modalState.visible = false;
};

const handleModalConfirm = () => {
  modalFormRef.value?.submit();
};

const handleDelete = (index: number) => {
  if (formData.payment_qr_code) {
    formData.payment_qr_code.splice(index, 1);
  }
};
</script>
<template>
  <SettingCard
    id="article-setting"
    title="文章设置"
    :is-change="isDirty"
    :submitting="formState.submitting"
    @reset="handleReset"
    @save="handleSave"
  >
    <UForm
      ref="formRef"
      class="space-y-4"
      :schema="schema"
      :state="formData"
      :validate-on-input-delay="100"
      @submit="handleSubmit"
    >
      <UFormField
        name="comment_max_length"
        label="评论长度"
        description="限制文章评论的最大文本长度，默认3000字"
        :ui="{
          container: 'mt-2',
          description: 'text-xs text-gray-400'
        }"
      >
        <UInputNumber v-model="formData.comment_max_length" placeholder="最大长度" />
      </UFormField>
      <UFormField
        name="payment_qr_code"
        label="打赏收款码"
        :ui="{
          container: 'mt-2'
        }"
      >
        <ul class="qr-list">
          <li v-for="(item, index) in formData.payment_qr_code" :key="index" class="qr-list__item">
            <button type="button" class="qr-list__delete-btn" @click="handleDelete(index)">
              <UIcon name="ep:close" class="text-white" size="16" />
            </button>
            <img class="qr-list__img" :src="item.image" :alt="item.name" />
            <div class="qr-list__name" :title="item.name">
              {{ item.name }}
            </div>
          </li>

          <li class="qr-list__item">
            <button type="button" class="qr-list__add-btn" @click="handleAddQr">
              <UIcon name="ep:plus" size="36" />
              <span>添加收款码</span>
            </button>
          </li>
        </ul>
      </UFormField>
    </UForm>

    <BasicModal
      v-model:visible="modalState.visible"
      title="添加收款码"
      @confirm="handleModalConfirm"
    >
      <UForm
        ref="modalFormRef"
        :state="modalFormData"
        :schema="modalSchema"
        :validate-on-input-delay="100"
        @submit="handleModalSubmit"
      >
        <UFormField name="name" label="收款码名称">
          <UInput v-model="modalFormData.name" placeholder="请输入收款码名称" />
        </UFormField>
        <UFormField name="image" label="收款码图片链接">
          <UInput v-model="modalFormData.image" icon="ep:link" placeholder="请输入链接" />
        </UFormField>
      </UForm>
    </BasicModal>
  </SettingCard>
</template>
<style scoped lang="scss">
.qr-list {
  --item-bg-color: #000;
  --qr-name-bg-color: #232323;

  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  &__item {
    box-shadow: var(--box-shadow);
    padding: 4px;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    user-select: none;
    background-color: var(--item-bg-color);

    &:hover {
      .qr-list__delete-btn {
        opacity: 0.7;
      }
    }
  }

  &__delete-btn {
    position: absolute;
    top: -4px;
    right: -4px;
    line-height: 1;
    padding: 6px 6px 4px 4px;
    cursor: pointer;
    border-bottom-left-radius: 18px;
    opacity: 0;
    background-color: #f87171;
    transform: opacity 0.35s;
    color: #fff;

    &:hover {
      opacity: 1;
    }
  }

  &__img {
    width: 160px;
    height: 160px;
    vertical-align: bottom;
  }

  &__name {
    width: 160px;
    height: 32px;
    line-height: 32px;
    border-radius: 4px;
    padding: 0 6px;
    text-align: center;
    cursor: default;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    white-space: nowrap;
    background-color: var(--qr-name-bg-color);
    margin-top: 4px;
  }

  &__add-btn {
    width: 160px;
    height: 192px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--text-color-3);
    cursor: pointer;

    &:hover {
      color: var(--text-color-2);
    }
  }
}
</style>
