<script setup lang="ts">
import type { PropType } from "vue";
import type { FleetingThought } from "#shared/types/fleeting-thought";
import { createFleetingThought, updateFleetingThought } from "@/apis/fleeting-thought";
import { TipTapEditor } from "@/components/tiptap-editor";
import { MarkdownSupportURL } from "@@/shared/constants";

const $message = useMessage();

const emits = defineEmits(["submitted", "updated", "cancel"]);

const props = defineProps({
  data: {
    type: Object as PropType<FleetingThought>
  },
  showCancelBtn: {
    type: Boolean,
    default: true
  }
});

const state = reactive<{
  submitting: boolean;
}>({
  submitting: false
});

const formData = reactive<{
  public: boolean;
  content: string;
}>({
  public: props.data ? props.data.public : true,
  content: props.data ? props.data.content : ""
});

const handleSubmit = async () => {
  if (formData.content.trim() === "") {
    $message.warning("内容不能为空");
    return;
  }

  state.submitting = true;
  try {
    if (props.data) {
      const response = await updateFleetingThought({
        id: props.data.id,
        public: formData.public,
        content: formData.content.trim()
      });
      emits("updated", response);
    } else {
      const response = await createFleetingThought({
        public: formData.public,
        content: formData.content.trim()
      });
      emits("submitted", response);
    }

    $message.success("提交成功");
    formData.content = "";
  } catch (error) {
    console.error(error);
    $message.error("提交失败" + error);
  } finally {
    state.submitting = false;
  }
};

const handleCancel = () => {
  emits("cancel");
};
</script>
<template>
  <div class="fleeting-thought-editor" @wheel.stop>
    <TipTapEditor v-model="formData.content" />

    <div class="fleeting-thought-editor__footer">
      <a class="fleeting-thought-editor__md-support" :href="MarkdownSupportURL" target="_blank">
        <UIcon name="custom:markdown-fill" :size="18" />
        支持Markdown语法
      </a>
      <div class="fleeting-thought-editor__submit-btn">
        <USwitch
          v-model="formData.public"
          unchecked-icon="lucide:eye-closed"
          checked-icon="lucide:eye"
          :disabled="state.submitting"
        />
        <UButton
          v-if="props.showCancelBtn"
          color="neutral"
          variant="outline"
          :disabled="state.submitting"
          @click="handleCancel"
        >
          取消
        </UButton>
        <UButton color="primary" :loading="state.submitting" @click="handleSubmit">
          {{ props.data ? "更新笔记" : "提交笔记" }}
        </UButton>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.fleeting-thought-editor {
  background-color: var(--box-bg-color);
  padding: 1rem;
  box-shadow: var(--box-shadow);
  border-radius: var(--radius-wrap);

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
  }

  &__md-support {
    color: var(--text-color-2);
    font-size: 0.875rem;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.25rem;

    &:hover {
      color: var(--theme-color);
    }
  }

  &__submit-btn {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
}
</style>
