<script setup lang="ts">
import type { IClientConfigMePage } from "#shared/types/config";
import { InputTagArea } from "@/components/form/input";
import { useForm } from "@/composables/useForm";
import { useConfigStore } from "@/stores";
import { cloneDeep } from "es-toolkit";
import { z } from "zod";
import SettingCard from "./SettingCard.vue";
import MePageBaseInfoForm from "./components/MePageBaseInfoForm.vue";
import MePageFaqForm from "./components/MePageFaqForm.vue";
import MePageLinkListForm from "./components/MePageLinkListForm.vue";
import MePageProfileTagsForm from "./components/MePageProfileTagsForm.vue";
import MePageSkillGridForm from "./components/MePageSkillGridForm.vue";
import MePageSocialLinksForm from "./components/MePageSocialLinksForm.vue";
import MePageSkillsSortableTable from "./components/MePageSkillsSortableTable.vue";

const configStore = useConfigStore();

/**
 * 个人页（/me）使用的配置项：
 * - configStore.me_page：个人页大部分内容
 * - 头像来源：me_page.author.avatar（/me 页面使用该字段）
 */
const createInitialFormData = (): IClientConfigMePage => {
  return cloneDeep(configStore.me_page);
};

const { formData, formState, isDirty, setForm, setInitial, resetForm } =
  useForm<IClientConfigMePage>(createInitialFormData());

/**
 * 顶层表单校验：只做最基础的必填/URL 检查。
 * 复杂列表项（如 base_info、links、faq 等）在对应弹窗内做校验。
 */
const schema = z.object({
  author: z.object({
    name: z.string({ message: "请输入名称" }).min(1, "请输入名称"),
    avatar: z.union([z.string().url("请输入正确的头像链接"), z.literal("")]).optional(),
    location: z.string().optional(),
    dev_role: z.string().optional(),
    dev_direction: z.string().optional(),
    quote: z.string().optional()
  }),
  github_snake: z.object({
    light: z.union([z.string().url("请输入正确的图片链接"), z.literal("")]).optional(),
    dark: z.union([z.string().url("请输入正确的图片链接"), z.literal("")]).optional()
  })
});

const syncFormData = () => {
  const nextFormData = createInitialFormData();
  setInitial(nextFormData);
  setForm(nextFormData);
};

const formRef = useTemplateRef("formRef");
const handleSave = () => {
  formRef.value?.submit();
};

const handleSubmit = async () => {
  formState.submitting = true;
  try {
    await configStore.update({
      me_page: cloneDeep(formData)
    });

    syncFormData();
  } finally {
    formState.submitting = false;
  }
};

const handleReset = () => {
  resetForm();
};
</script>

<template>
  <SettingCard
    id="me-page-setting"
    title="个人页（Me）配置"
    :is-change="isDirty"
    :submitting="formState.submitting"
    @reset="handleReset"
    @save="handleSave"
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
        label="头像"
        description="个人页头像（me_page.author.avatar）；留空将回退到默认头像"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.author.avatar"
          class="w-full"
          icon="i-lucide-link"
          placeholder="https://... 或 /images/avatar.webp"
        />
      </UFormField>

      <UFormField
        name="author.name"
        label="作者名称"
        description="个人页左侧卡片展示的名称"
        required
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput v-model="formData.author.name" class="w-full" placeholder="请输入作者名称" />
      </UFormField>

      <UFormField
        name="author.location"
        label="所在地"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput v-model="formData.author.location" class="w-full" placeholder="例如：成都" />
      </UFormField>

      <UFormField
        name="author.dev_role"
        label="职位/角色"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput v-model="formData.author.dev_role" class="w-full" placeholder="例如：前端工程师" />
      </UFormField>

      <UFormField
        name="author.dev_direction"
        label="方向"
        description="显示在 Hello 标题下方的那一行"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.author.dev_direction"
          class="w-full"
          placeholder="例如：Web / Full Stack"
        />
      </UFormField>

      <UFormField
        name="author.quote"
        label="简介/座右铭"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UTextarea
          v-model="formData.author.quote"
          class="w-full"
          :rows="3"
          placeholder="一句话介绍"
        />
      </UFormField>

      <MePageProfileTagsForm v-model="formData.author.tags" />

      <UFormField
        name="github_snake.light"
        label="GitHub Snake（亮色）"
        description="建议填写图片 URL"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.github_snake.light"
          class="w-full"
          icon="i-lucide-link"
          placeholder="https://..."
        />
      </UFormField>

      <UFormField
        name="github_snake.dark"
        label="GitHub Snake（暗色）"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.github_snake.dark"
          class="w-full"
          icon="i-lucide-link"
          placeholder="https://..."
        />
      </UFormField>

      <MePageBaseInfoForm v-model="formData.intro.base_info" />

      <MePageSkillsSortableTable v-model="formData.intro.skills" />

      <UFormField
        label="兴趣标签"
        description="对应个人页的“我的兴趣”"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <InputTagArea v-model="formData.intro.interest_tags" label="添加兴趣" />
      </UFormField>

      <UFormField
        label="语言能力"
        description="对应个人页的“语言能力”"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <InputTagArea v-model="formData.intro.language_proficiency" label="添加语言" />
      </UFormField>

      <MePageSkillGridForm v-model="formData.skills_grid" />

      <MePageLinkListForm v-model="formData.website_list" type="website" />

      <MePageLinkListForm v-model="formData.project_list" type="project" />

      <MePageSocialLinksForm v-model="formData.social_links" />

      <MePageFaqForm v-model="formData.faq_items" />
    </UForm>
  </SettingCard>
</template>
