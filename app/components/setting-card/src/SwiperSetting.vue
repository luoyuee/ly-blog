<script setup lang="ts">
import type { IClientConfigSwiperItem } from "@@/shared/types/config";
import type { FormSubmitEvent, TableColumn } from "@nuxt/ui";
import { BasicModal } from "@/components/basic-modal";
import { Swiper } from "@/components/swiper";
import { h, resolveComponent } from "vue";
import { useConfigStore } from "@/stores";
import { cloneDeep } from "es-toolkit";
import { z } from "zod";

const configStore = useConfigStore();

const UButton = resolveComponent("UButton");

const formData = ref<IClientConfigSwiperItem[]>([]);

const state = reactive({
  isChange: false,
  submitting: false
});

const modalSchema = z.object({
  title: z.string({ message: "请输入标题" }).min(1, "请输入标题"),
  href: z.url("请输入链接").superRefine((value, ctx) => {
    if (modalState.isEdit) return;

    if (formData.value.find((item) => item.href === value)) {
      ctx.addIssue({
        code: "custom",
        message: "链接重复"
      });
    }
  }),
  image: z.string({ message: "请输入图片链接" }).min(1, "请输入图片链接")
});

onMounted(() => {
  formData.value = cloneDeep(configStore.swiper);
});

const handleSave = async () => {
  state.submitting = true;
  try {
    await configStore.update({
      swiper: unref(formData)
    });

    handleReset();
  } finally {
    state.submitting = false;
  }
};

const handleReset = () => {
  formData.value = cloneDeep(configStore.swiper);
  state.isChange = false;
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
    const item = formData.value.find((item) => item.href === href);
    if (item) {
      item.title = title;
      item.image = image;
    }
  } else {
    formData.value.push({ title, href, image });
  }

  state.isChange = true;
  modalState.visible = false;
};

const handleModalConfirm = () => {
  modalFormRef.value?.submit();
};

const columns: TableColumn<IClientConfigSwiperItem>[] = [
  {
    accessorKey: "title",
    header: "标题"
  },
  {
    accessorKey: "href",
    header: "链接",
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
    header: "图片",
    cell: ({ row }) => {
      const { image } = row.original;

      return h("div", { class: "w-12 h-12 rounded-md overflow-hidden" }, [
        h("img", {
          src: image,
          alt: "轮播图图片",
          class: "w-full h-full object-cover"
        })
      ]);
    }
  },
  {
    id: "actions",
    header: "操作",
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
          icon: "ep:edit",
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
          icon: "ep:delete",
          onClick: () => {
            formData.value = formData.value.filter((item) => item.href !== href);
            state.isChange = true;
          }
        })
      ]);
    }
  }
];
</script>
<template>
  <div id="swiper-setting" class="swiper-setting p-4 shadow-md rounded">
    <div class="mb-4 flex justify-between items-center min-h-8">
      <h3 class="pl-2 border-l-4 border-primary leading-none">轮播图</h3>
      <div v-if="state.isChange" class="space-x-2">
        <UButton variant="outline" size="sm" :disabled="state.submitting" @click="handleReset">
          取消
        </UButton>
        <UButton size="sm" :loading="state.submitting" @click="handleSave"> 保存 </UButton>
      </div>
    </div>

    <Swiper v-if="formData && formData.length > 0" :items="formData" class="mb-4 w-[320px]" />

    <div class="space-y-2">
      <div class="flex justify-between items-center py-2">
        <span class="text-xs text-gray-400">首页轮播展示的图片列表</span>
        <UButton size="xs" icon="ep:plus" @click="handleAdd"> 添加 </UButton>
      </div>
      <div class="border border-muted rounded-md overflow-hidden">
        <UTable :data="formData" :columns="columns" sticky class="max-h-64" />
      </div>
    </div>

    <BasicModal
      v-model:visible="modalState.visible"
      :title="modalState.isEdit ? '编辑数据' : '添加数据'"
      @confirm="handleModalConfirm"
    >
      <UForm
        ref="modalFormRef"
        :state="modalFormData"
        :schema="modalSchema"
        :validate-on-input-delay="100"
        @submit="handleModalSubmit"
      >
        <UFormField name="title" label="标题">
          <UInput v-model="modalFormData.title" placeholder="请输入链接标题" />
        </UFormField>
        <UFormField name="href" label="链接">
          <UInput
            v-model="modalFormData.href"
            icon="ep:link"
            :disabled="modalState.isEdit"
            placeholder="请输入链接"
          />
        </UFormField>
        <UFormField name="image" label="图片">
          <UInput v-model="modalFormData.image" icon="ep:link" placeholder="请输入图片链接" />
        </UFormField>
      </UForm>
    </BasicModal>
  </div>
</template>
