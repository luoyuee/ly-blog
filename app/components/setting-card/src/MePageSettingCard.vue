<script setup lang="ts">
import type { IMePageConfig } from "#shared/types/config";
import { InputTagArea } from "@/components/form/input";
import { useForm } from "@/composables/useForm";
import { useMePageConfigStore } from "@/stores";
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

const { t } = useI18n();

const mePageConfigStore = useMePageConfigStore();

/**
 * 个人页（/me）使用的配置项：
 * - 已独立为平级配置项，仅 `/me` 页面与设置面板会读取
 * - 头像来源：author.avatar（/me 页面使用该字段）
 */
const createInitialFormData = (): IMePageConfig => {
  return cloneDeep(mePageConfigStore.$state);
};

const { formData, formState, isDirty, setForm, setInitial, resetForm } =
  useForm<IMePageConfig>(createInitialFormData());

/**
 * 顶层表单校验：只做最基础的必填/URL 检查。
 * 复杂列表项（如 base_info、links、faq 等）在对应弹窗内做校验。
 */
const schema = z.object({
  author: z.object({
    name: z
      .string({ message: t("components.settingCard.mePage.validation.nameRequired") })
      .min(1, t("components.settingCard.mePage.validation.nameRequired")),
    avatar: z
      .union([z.url(t("components.settingCard.mePage.validation.avatarInvalid")), z.literal("")])
      .optional(),
    location: z.string().optional(),
    dev_role: z.string().optional(),
    dev_direction: z.string().optional(),
    quote: z.string().optional()
  }),
  github_snake: z.object({
    light: z
      .union([z.url(t("components.settingCard.mePage.validation.imageInvalid")), z.literal("")])
      .optional(),
    dark: z
      .union([z.url(t("components.settingCard.mePage.validation.imageInvalid")), z.literal("")])
      .optional()
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
    await mePageConfigStore.update(cloneDeep(formData));

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
    :title="$t('components.settingCard.mePage.title')"
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
        :label="$t('components.settingCard.mePage.avatarLabel')"
        :description="$t('components.settingCard.mePage.avatarDescription')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.author.avatar"
          class="w-full"
          icon="lucide:link"
          :placeholder="$t('components.settingCard.mePage.avatarPlaceholder')"
        />
      </UFormField>

      <UFormField
        name="author.name"
        :label="$t('components.settingCard.mePage.authorNameLabel')"
        :description="$t('components.settingCard.mePage.authorNameDescription')"
        required
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.author.name"
          class="w-full"
          :placeholder="$t('components.settingCard.mePage.authorNamePlaceholder')"
        />
      </UFormField>

      <UFormField
        name="author.location"
        :label="$t('components.settingCard.mePage.locationLabel')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.author.location"
          class="w-full"
          :placeholder="$t('components.settingCard.mePage.locationPlaceholder')"
        />
      </UFormField>

      <UFormField
        name="author.dev_role"
        :label="$t('components.settingCard.mePage.devRoleLabel')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.author.dev_role"
          class="w-full"
          :placeholder="$t('components.settingCard.mePage.devRolePlaceholder')"
        />
      </UFormField>

      <UFormField
        name="author.dev_direction"
        :label="$t('components.settingCard.mePage.devDirectionLabel')"
        :description="$t('components.settingCard.mePage.devDirectionDescription')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.author.dev_direction"
          class="w-full"
          :placeholder="$t('components.settingCard.mePage.devDirectionPlaceholder')"
        />
      </UFormField>

      <UFormField
        name="author.quote"
        :label="$t('components.settingCard.mePage.quoteLabel')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UTextarea
          v-model="formData.author.quote"
          class="w-full"
          :rows="3"
          :placeholder="$t('components.settingCard.mePage.quotePlaceholder')"
        />
      </UFormField>

      <MePageProfileTagsForm v-model="formData.author.tags" />

      <UFormField
        name="github_snake.light"
        :label="$t('components.settingCard.mePage.snakeLightLabel')"
        :description="$t('components.settingCard.mePage.snakeLightDescription')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.github_snake.light"
          class="w-full"
          icon="lucide:link"
          placeholder="https://..."
        />
      </UFormField>

      <UFormField
        name="github_snake.dark"
        :label="$t('components.settingCard.mePage.snakeDarkLabel')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.github_snake.dark"
          class="w-full"
          icon="lucide:link"
          placeholder="https://..."
        />
      </UFormField>

      <MePageBaseInfoForm v-model="formData.intro.base_info" />

      <MePageSkillsSortableTable v-model="formData.intro.skills" />

      <UFormField
        :label="$t('components.settingCard.mePage.interestTagsLabel')"
        :description="$t('components.settingCard.mePage.interestTagsDescription')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <InputTagArea
          v-model="formData.intro.interest_tags"
          :label="$t('components.settingCard.mePage.interestTagsPlaceholder')"
        />
      </UFormField>

      <UFormField
        :label="$t('components.settingCard.mePage.languagesLabel')"
        :description="$t('components.settingCard.mePage.languagesDescription')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <InputTagArea
          v-model="formData.intro.language_proficiency"
          :label="$t('components.settingCard.mePage.languagesPlaceholder')"
        />
      </UFormField>

      <MePageSkillGridForm v-model="formData.skills_grid" />

      <MePageLinkListForm v-model="formData.website_list" type="website" />

      <MePageLinkListForm v-model="formData.project_list" type="project" />

      <MePageSocialLinksForm v-model="formData.social_links" />

      <MePageFaqForm v-model="formData.faq_items" />
    </UForm>
  </SettingCard>
</template>
