<script setup lang="ts">
import type { ArticleCategory } from "#shared/types/article";
import { Descriptions, DescriptionsItem } from "@/components/descriptions";
import { getArticleCategoryDetails } from "@/apis/article";
import { BasicModal } from "@/components/basic-modal";
import { watch } from "vue";
import dayjs from "dayjs";

const open = defineModel<boolean>("open", {
  default: false
});

const props = defineProps({
  category: {
    type: Object as PropType<ArticleCategory>,
    default: undefined
  }
});

const emits = defineEmits<{
  close: [
    result:
      | {
          action: "closed";
        }
      | {
          action: "cancelled";
        }
  ];
}>();

const data = ref<Partial<ArticleCategory>>({});

// 监听弹窗显示，加载分类详情
watch(
  open,
  async (newVal) => {
    if (!newVal) {
      data.value = {};
      return;
    }

    if (!props.category) return;

    data.value = await getArticleCategoryDetails(props.category.id);
  },
  {
    immediate: true
  }
);

const handleCancel = () => {
  open.value = false;
  emits("close", {
    action: "closed"
  });
};
</script>
<template>
  <BasicModal
    v-model:open="open"
    :title="$t('components.lyEditor.modules.article.categoryDetailsTitle')"
    :cancel-button-text="$t('common.close')"
    :show-confirm-button="false"
    @cancel="handleCancel"
  >
    <Descriptions>
      <DescriptionsItem :label="$t('components.lyEditor.modules.article.categoryFields.parent')">
        {{ data.parent_id }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('components.lyEditor.modules.article.categoryFields.name')">
        {{ data.name }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('components.lyEditor.modules.article.categoryFields.icon')">
        <UIcon v-if="data.icon" :name="data.icon" />
        <UIcon v-else name="colorful:folder" />
      </DescriptionsItem>
      <DescriptionsItem
        :label="$t('components.lyEditor.modules.article.categoryFields.description')"
      >
        {{ data.description }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('components.lyEditor.modules.article.categoryFields.createdAt')">
        {{
          data.created_at
            ? dayjs(data.created_at).format($t("format.datetime"))
            : $t("placeholder.hyphen")
        }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('components.lyEditor.modules.article.categoryFields.updatedAt')">
        {{
          data.updated_at
            ? dayjs(data.updated_at).format($t("format.datetime"))
            : $t("placeholder.hyphen")
        }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('components.lyEditor.modules.article.categoryFields.count')">
        {{ data.count }}
      </DescriptionsItem>
    </Descriptions>
  </BasicModal>
</template>
