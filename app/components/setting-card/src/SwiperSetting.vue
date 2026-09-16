<script setup lang="ts">
import type { IClientConfigSwiperItem } from "#shared/types/config";
import type { FormSubmitEvent, TableColumn } from "@nuxt/ui";
import { BasicModal } from "@/components/basic-modal";
import { useForm } from "@/composables/useForm";
import { Swiper } from "@/components/swiper";
import { h, resolveComponent } from "vue";
import { useConfigStore } from "@/stores";
import { cloneDeep } from "es-toolkit";
import { z } from "zod";
import SettingCard from "./SettingCard.vue";

const { t } = useI18n();

const configStore = useConfigStore();

const UButton = resolveComponent("UButton");

type SwiperFormData = {
  items: IClientConfigSwiperItem[];
};

const createInitialFormData = (): SwiperFormData => {
  return {
    items: cloneDeep(configStore.swiper)
  };
};

const { formData, formState, isDirty, setForm, setInitial, resetForm } =
  useForm<SwiperFormData>(createInitialFormData());

const syncFormData = () => {
  const nextFormData = createInitialFormData();
  setInitial(nextFormData);
  setForm(nextFormData);
};

const modalSchema = z.object({
  title: z
    .string({ message: t("components.settingCard.swiper.validation.titleRequired") })
    .min(1, t("components.settingCard.swiper.validation.titleRequired")),
  href: z
    .url(t("components.settingCard.swiper.validation.linkInvalid"))
    .superRefine((value, ctx) => {
      if (modalState.isEdit) return;

      if (formData.items.find((item) => item.href === value)) {
        ctx.addIssue({
          code: "custom",
          message: t("components.settingCard.swiper.validation.duplicateLink")
        });
      }
    }),
  image: z
    .string({ message: t("components.settingCard.swiper.validation.imageRequired") })
    .min(1, t("components.settingCard.swiper.validation.imageRequired"))
});

const handleSave = async () => {
  formState.submitting = true;
  try {
    await configStore.update({
      swiper: cloneDeep(formData.items)
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
  visible: false,
  isEdit: false
});

const modalFormData = reactive<IClientConfigSwiperItem>({
  title: "",
  href: "",
  image: ""
});

const modalFormRef = useTemplateRef("modalFormRef");

const handleAdd = () => {
  modalFormData.title = "";
  modalFormData.href = "";
  modalFormData.image = "";

  modalState.isEdit = false;
  modalState.visible = true;
};

const handleModalSubmit = (event: FormSubmitEvent<z.output<typeof modalSchema>>) => {
  const { title, href, image } = event.data;

  if (modalState.isEdit) {
    const item = formData.items.find((item) => item.href === href);
    if (item) {
      item.title = title;
      item.image = image;
    }
  } else {
    formData.items.push({ title, href, image });
  }

  modalState.visible = false;
};

const handleModalConfirm = () => {
  modalFormRef.value?.submit();
};

const columns: TableColumn<IClientConfigSwiperItem>[] = [
  {
    accessorKey: "title",
    header: t("components.settingCard.swiper.titleLabel")
  },
  {
    accessorKey: "href",
    header: t("components.settingCard.swiper.linkLabel"),
    cell: ({ row }) => {
      const { href } = row.original;

      return h(
        "a",
        {
          href,
          target: "_blank",
          rel: "noopener noreferrer",
          class: "text-primary block w-32 overflow-hidden whitespace-nowrap text-ellipsis"
        },
        href
      );
    }
  },
  {
    accessorKey: "image",
    header: t("components.settingCard.swiper.imageLabel"),
    cell: ({ row }) => {
      const { image } = row.original;

      return h("div", { class: "w-12 h-12 rounded-md overflow-hidden" }, [
        h("img", {
          src: image,
          alt: t("components.settingCard.swiper.imageAlt"),
          class: "w-full h-full object-cover"
        })
      ]);
    }
  },
  {
    id: "actions",
    header: t("components.settingCard.common.actions"),
    meta: {
      class: {
        th: "text-right",
        td: "text-right"
      }
    },
    cell: ({ row }) => {
      const { title, href, image } = row.original;

      return h("div", { class: "flex justify-end gap-2" }, [
        h(UButton, {
          size: "xs",
          color: "primary",
          variant: "ghost",
          icon: "lucide:edit",
          onClick: () => {
            modalFormData.title = title;
            modalFormData.href = href;
            modalFormData.image = image;

            modalState.isEdit = true;
            modalState.visible = true;
          }
        }),
        h(UButton, {
          size: "xs",
          color: "error",
          variant: "ghost",
          icon: "lucide:trash-2",
          onClick: () => {
            formData.items = formData.items.filter((item) => item.href !== href);
          }
        })
      ]);
    }
  }
];
</script>
<template>
  <SettingCard
    id="swiper-setting"
    :title="$t('components.settingCard.swiper.title')"
    :is-change="isDirty"
    :submitting="formState.submitting"
    @reset="handleReset"
    @save="handleSave"
  >
    <Swiper v-if="formData.items.length > 0" :items="formData.items" class="mb-4 w-[320px]" />

    <div class="space-y-2">
      <div class="flex justify-between items-center py-2">
        <span class="text-xs text-gray-400">
          {{ $t("components.settingCard.swiper.listHint") }}
        </span>
        <UButton size="xs" icon="lucide:plus" @click="handleAdd">{{ $t("common.add") }}</UButton>
      </div>
      <div class="border border-muted rounded-md overflow-hidden">
        <UTable :data="formData.items" :columns="columns" sticky class="max-h-64" />
      </div>
    </div>

    <BasicModal
      v-model:open="modalState.visible"
      :title="
        modalState.isEdit
          ? $t('components.settingCard.swiper.editModalTitle')
          : $t('components.settingCard.swiper.addModalTitle')
      "
      @confirm="handleModalConfirm"
    >
      <UForm
        ref="modalFormRef"
        :state="modalFormData"
        :schema="modalSchema"
        :validate-on-input-delay="100"
        @submit="handleModalSubmit"
      >
        <UFormField name="title" :label="$t('components.settingCard.swiper.titleLabel')">
          <UInput
            v-model="modalFormData.title"
            :placeholder="$t('components.settingCard.swiper.titlePlaceholder')"
          />
        </UFormField>
        <UFormField name="href" :label="$t('components.settingCard.swiper.linkLabel')">
          <UInput
            v-model="modalFormData.href"
            icon="lucide:link"
            :disabled="modalState.isEdit"
            :placeholder="$t('components.settingCard.swiper.linkPlaceholder')"
          />
        </UFormField>
        <UFormField name="image" :label="$t('components.settingCard.swiper.imageLabel')">
          <UInput
            v-model="modalFormData.image"
            icon="lucide:link"
            :placeholder="$t('components.settingCard.swiper.imagePlaceholder')"
          />
        </UFormField>
      </UForm>
    </BasicModal>
  </SettingCard>
</template>
