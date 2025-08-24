<script setup lang="ts">
import type { HitokotoTypeItem } from "#shared/types/hitokoto";
import { getHitokotoDetails } from "@/apis/hitokoto";
import { BasicModal } from "@/components/basic-modal";

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
  open: handleOpen
});

const handleCancel = () => {
  visible.value = false;
  emits("cancel");
};
</script>
<template>
  <BasicModal v-model:visible="visible" title="分类详情">
    <el-descriptions class="w-full">
      <el-descriptions-item label="分类名称">{{ data.name }}</el-descriptions-item>
      <el-descriptions-item label="分类描述">{{ data.description }}</el-descriptions-item>
      <el-descriptions-item label="创建日期">{{ data.created_at }}</el-descriptions-item>
      <el-descriptions-item label="更新日期">{{ data.updated_at }}</el-descriptions-item>
      <el-descriptions-item label="语句数量">{{ data.count }}</el-descriptions-item>
    </el-descriptions>
  </BasicModal>
</template>
