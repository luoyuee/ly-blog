<script setup lang="ts">
import type { HitokotoTypeItem } from "#shared/types/hitokoto";
import { getHitokotoDetails } from "@/apis/hitokoto";
import { Descriptions, DescriptionsItem } from "@/components/descriptions-v2";
import { BasicModal } from "@/components/basic-modal";
import dayjs from "dayjs";

const props = defineProps<{
  open?: boolean;
  payload?: HitokotoTypeItem;
}>();

const emits = defineEmits<{
  cancel: [];
  resolve: [
    result:
      | {
          action: "closed";
        }
      | {
          action: "cancelled";
        }
  ];
}>();

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

watch(
  () => props.open,
  (open) => {
    if (open && props.payload) {
      handleOpen(props.payload);
    } else {
      visible.value = false;
    }
  },
  {
    immediate: true
  }
);

const handleCancel = () => {
  visible.value = false;
  emits("cancel");
  emits("resolve", {
    action: "closed"
  });
};
</script>
<template>
  <BasicModal v-model:visible="visible" title="分类详情">
    <Descriptions class="w-full">
      <DescriptionsItem label="分类名称">{{ data.name }}</DescriptionsItem>
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
      <DescriptionsItem label="语句数量">{{ data.count }}</DescriptionsItem>
    </Descriptions>

    <template #footer>
      <UButton label="关闭" @click="handleCancel" />
    </template>
  </BasicModal>
</template>
