<script setup lang="ts">
import type {
  HitokotoTypeDetailsModalPayload,
  HitokotoTypeDetailsModalResult
} from "#shared/types/ly-editor";
import { Descriptions, DescriptionsItem } from "@/components/descriptions-v2";
import { getHitokotoDetails } from "@/apis/hitokoto";
import { BasicModal } from "@/components/basic-modal";
import dayjs from "dayjs";

const visible = defineModel<boolean>("visible", {
  default: false
});

const props = defineProps({
  payload: {
    type: Object as PropType<HitokotoTypeDetailsModalPayload>,
    default: undefined
  }
});

const emits = defineEmits<{
  resolve: [result: HitokotoTypeDetailsModalResult];
}>();

const data = ref<Partial<HitokotoTypeDetailsModalPayload>>({});

watch(
  [visible, () => props.payload?.id],
  async ([newVal, id]) => {
    if (!newVal || !id) {
      data.value = {};
      visible.value = false;
      return;
    }

    data.value = await getHitokotoDetails(id);
  },
  {
    immediate: true
  }
);

const handleCancel = () => {
  visible.value = false;
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
