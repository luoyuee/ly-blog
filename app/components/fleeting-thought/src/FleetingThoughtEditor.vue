<script setup lang="ts">
import type { PropType } from "vue";
import type { FleetingThought } from "#shared/types/fleeting-thought";
import { createFleetingThought, updateFleetingThought } from "@/apis/fleeting-thought";
import { TipTapEditor } from "@/components/tiptap-editor";
import { MarkdownSupportURL } from "#shared/constants";
import { useLogger } from "@/composables/useLogger";

const logger = useLogger();
const $message = useMessage();
const { t } = useI18n();

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
    $message.warning(t("components.fleetingThought.editor.emptyWarning"));
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

    $message.success(t("components.fleetingThought.editor.submitSuccess"));
    formData.content = "";
  } catch (error) {
    logger.error(error);
    $message.error(t("components.fleetingThought.editor.submitError") + error);
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
        {{ $t("components.fleetingThought.editor.mdHint") }}
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
          {{ $t("components.fleetingThought.editor.cancel") }}
        </UButton>
        <UButton color="primary" :loading="state.submitting" @click="handleSubmit">
          {{
            props.data
              ? $t("components.fleetingThought.editor.update")
              : $t("components.fleetingThought.editor.submit")
          }}
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
