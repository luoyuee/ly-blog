<script setup lang="ts">
import type { HitokotoTypeItem } from "@/types/hitokoto";
import { getHitokotoDetails } from "@/apis/hitokoto";
import { Descriptions, DescriptionsItem } from "@/components/descriptions";

const emits = defineEmits(["cancel"]);

const visible = ref(false);

const data = ref<Partial<HitokotoTypeItem>>({});

const handleOpen = (e: HitokotoTypeItem) => {
  visible.value = true;

  getHitokotoDetails(e.id).then((res) => {
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
      <Descriptions class="w-full">
        <DescriptionsItem label="分类名称" :content="data.name" />
        <DescriptionsItem label="分类描述" :content="data.description" />
        <DescriptionsItem label="创建日期" :content="data.created_at" />
        <DescriptionsItem label="更新日期" :content="data.updated_at" />
        <DescriptionsItem label="语句数量" :content="data.count" />
      </Descriptions>
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
