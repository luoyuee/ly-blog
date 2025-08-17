<script setup lang="ts">
import type { ArticleCategoryItem } from "@/types/article";
import { getArticleCategoryDetails } from "@/apis/article";
import dayjs from "dayjs";

const emits = defineEmits(["cancel"]);

const visible = ref(false);

const data = ref<Partial<ArticleCategoryItem>>({});

const handleOpen = (e: ArticleCategoryItem) => {
  visible.value = true;

  getArticleCategoryDetails(e.id).then((res) => {
    data.value = res;
  });
};

defineExpose({
  open: handleOpen,
});

const handleCancel = () => {
  visible.value = false;
  emits("cancel");
};
</script>
<template>
  <UModal
    v-model:open="visible"
    title="分类详情"
    :ui="{ footer: 'justify-end', overlay: 'bg-elevated/40' }"
  >
    <template #body>
      <table class="w-full">
        <tbody>
          <tr>
            <td
              class="border-1 border-white/20 bg-white/5 py-1 px-2 text-nowrap w-fit"
            >
              父级分类
            </td>
            <td class="border-1 border-white/20 py-1 px-2 text-sm">
              {{ data.parent_id }}
            </td>
          </tr>
          <tr>
            <td
              class="border-1 border-white/20 bg-white/5 py-1 px-2 text-nowrap w-fit"
            >
              分类名称
            </td>
            <td class="border-1 border-white/20 py-1 px-2 text-sm">
              {{ data.name }}
            </td>
          </tr>
          <tr>
            <td
              class="border-1 border-white/20 bg-white/5 py-1 px-2 text-nowrap w-fit"
            >
              分类图标
            </td>
            <td class="border-1 border-white/20 py-1 px-2 text-sm">
              <UIcon :name="data.icon" v-if="data.icon" />
              <UIcon v-else name="custom-color:folder" />
            </td>
          </tr>
          <tr>
            <td
              class="border-1 border-white/20 bg-white/5 py-1 px-2 text-nowrap w-0"
            >
              分类描述
            </td>
            <td class="border-1 border-white/20 py-1 px-2 text-sm">
              {{ data.description }}
            </td>
          </tr>
          <tr>
            <td
              class="border-1 border-white/20 bg-white/5 py-1 px-2 text-nowrap w-0"
            >
              创建日期
            </td>
            <td class="border-1 border-white/20 py-1 px-2 text-sm">
              {{
                data.created_at
                  ? dayjs(data.created_at).format($t("format.datetime"))
                  : $t("placeholder.hyphen")
              }}
            </td>
          </tr>
          <tr>
            <td
              class="border-1 border-white/20 bg-white/5 py-1 px-2 text-nowrap w-0"
            >
              更新日期
            </td>
            <td class="border-1 border-white/20 py-1 px-2 text-sm">
              {{
                data.updated_at
                  ? dayjs(data.updated_at).format($t("format.datetime"))
                  : $t("placeholder.hyphen")
              }}
            </td>
          </tr>
          <tr>
            <td
              class="border-1 border-white/20 bg-white/5 py-1 px-2 text-nowrap w-0"
            >
              文章数量
            </td>
            <td class="border-1 border-white/20 py-1 px-2 text-sm">
              {{ data.count }}
            </td>
          </tr>
        </tbody>
      </table>
    </template>

    <template #footer>
      <UButton
        label="关闭"
        color="neutral"
        variant="outline"
        @click="handleCancel"
      />
    </template>
  </UModal>
</template>
