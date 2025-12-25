<script setup lang="ts">
import type { ArticleCategory } from "#shared/types/article";
import { Descriptions, DescriptionsItem } from "@/components/descriptions";
import { getArticleCategoryDetails } from "@/apis/article";
import { BasicModal } from "@/components/basic-modal";
import { mdcEditorEmitter } from "@/events";
import dayjs from "dayjs";

const emits = defineEmits(["cancel"]);

const visible = ref(false);

const data = ref<Partial<ArticleCategory>>({});

const handleOpen = (e: ArticleCategory) => {
  visible.value = true;

  getArticleCategoryDetails(e.id).then((res) => {
    data.value = res;
  });
};

mdcEditorEmitter.on("cmd.modal-manager:open:category-details", handleOpen);

defineExpose({
  open: handleOpen
});

const handleCancel = () => {
  visible.value = false;
  emits("cancel");
};
</script>
<template>
  <BasicModal
    v-model:visible="visible"
    title="分类详情"
    cancel-button-text="关闭"
    :show-confirm-button="false"
    @cancel="handleCancel"
  >
    <Descriptions>
      <DescriptionsItem label="父级分类">{{ data.parent_id }}</DescriptionsItem>
      <DescriptionsItem label="分类名称">{{ data.name }}</DescriptionsItem>
      <DescriptionsItem label="分类图标">
        <UIcon v-if="data.icon" :name="data.icon" />
        <UIcon v-else name="custom-color:folder" />
      </DescriptionsItem>
      <DescriptionsItem label="分类描述">{{ data.description }}</DescriptionsItem>
      <DescriptionsItem label="创建日期">
        {{
          data.created_at
            ? dayjs(data.created_at).format($t("format.datetime"))
            : $t("placeholder.hyphen")
        }}
      </DescriptionsItem>
      <DescriptionsItem label="更新日期">
        {{
          data.updated_at
            ? dayjs(data.updated_at).format($t("format.datetime"))
            : $t("placeholder.hyphen")
        }}
      </DescriptionsItem>
      <DescriptionsItem label="文章数量">{{ data.count }}</DescriptionsItem>
    </Descriptions>
  </BasicModal>
</template>
