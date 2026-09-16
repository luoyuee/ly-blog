<script setup lang="ts">
import type { PropType } from "vue";
import type { HitokotoTypeItem } from "#shared/types/hitokoto";
import type {
  HitokotoTypeDetailsModalPayload,
  HitokotoTypeDetailsModalResult
} from "#shared/types/ly-editor";
import { Descriptions, DescriptionsItem } from "@/components/descriptions";
import { getHitokotoDetails } from "@/apis/hitokoto";
import { BasicModal } from "@/components/basic-modal";
import dayjs from "dayjs";

const open = defineModel<boolean>("open", {
  default: false
});

const props = defineProps({
  record: {
    type: Object as PropType<HitokotoTypeDetailsModalPayload["record"]>,
    default: undefined
  }
});

const emits = defineEmits<{
  close: [result: HitokotoTypeDetailsModalResult];
}>();

const data = ref<Partial<HitokotoTypeItem>>({});

watch(
  [open, () => props.record?.id],
  async ([newVal, id]) => {
    if (!newVal || !id) {
      data.value = {};
      open.value = false;
      return;
    }

    data.value = await getHitokotoDetails(id);
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
    :title="$t('components.lyEditor.modules.hitokoto.typeDetailsTitle')"
  >
    <Descriptions class="w-full" :column="1">
      <DescriptionsItem :label="$t('components.lyEditor.modules.hitokoto.typeFields.name')">
        {{ data.name }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('components.lyEditor.modules.hitokoto.typeFields.description')">
        {{ data.description }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('components.lyEditor.modules.hitokoto.typeFields.createdAt')">
        {{
          data.created_at
            ? dayjs(data.created_at).format($t("format.datetime"))
            : $t("placeholder.hyphen")
        }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('components.lyEditor.modules.hitokoto.typeFields.updatedAt')">
        {{
          data.updated_at
            ? dayjs(data.updated_at).format($t("format.datetime"))
            : $t("placeholder.hyphen")
        }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('components.lyEditor.modules.hitokoto.typeFields.count')">
        {{ data.count }}
      </DescriptionsItem>
    </Descriptions>

    <template #footer>
      <UButton :label="$t('common.close')" @click="handleCancel" />
    </template>
  </BasicModal>
</template>
