<script setup lang="ts">
import type { FleetingThought } from "#shared/types/fleeting-thought";
import { TipTapEditor } from "@/components/tiptap-editor";
import { ElMessage } from "element-plus";
import { createFleetingThought, updateFleetingThought } from "@/apis/fleeting-thought";

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
    ElMessage.warning("内容不能为空");
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

    ElMessage.success("提交成功");
    formData.content = "";
  } catch (error) {
    console.error(error);
    ElMessage.error("提交失败" + error);
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
    <div class="footer">
      <a class="md-support" href="https://markdown.com.cn/cheat-sheet.html" target="_blank">
        <Icon name="custom:markdown-fill" :size="18" class="mr-1" />
        支持Markdown语法
      </a>
      <el-space :size="16">
        <el-switch
          v-model="formData.public"
          inline-prompt
          active-text="公开"
          inactive-text="隐藏"
        />
        <el-button v-if="props.showCancelBtn" :disabled="state.submitting" @click="handleCancel">
          取消
        </el-button>
        <el-button type="primary" :loading="state.submitting" @click="handleSubmit">
          {{ props.data ? "更新笔记" : "提交笔记" }}
        </el-button>
      </el-space>
    </div>
  </div>
</template>
<style scoped lang="scss">
.fleeting-thought-editor {
  background-color: var(--box-bg-color);
  padding: 1rem;
  box-shadow: var(--box-shadow);
  border-radius: var(--radius-wrap);

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    color: var(--text-color-2);

    .md-support {
      color: var(--text-color-2);
      font-size: 0.875rem;
      text-decoration: none;
      display: flex;
      align-items: center;

      &:hover {
        color: var(--theme-color);
      }
    }
  }
}
</style>
