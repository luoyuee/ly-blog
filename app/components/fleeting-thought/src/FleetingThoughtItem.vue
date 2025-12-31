<script setup lang="ts">
import type { FleetingThought } from "#shared/types/fleeting-thought";
import { PlatformIcon, BrowserIcon } from "#shared/constants";
import { useConfigStore, useUserStore } from "@/stores";
import { TiptapRender } from "@/components/tiptap-editor";
import { deleteFleetingThought, updateFleetingThought } from "@/apis/fleeting-thought";
import FleetingThoughtEditor from "./FleetingThoughtEditor.vue";
import Popconfirm from "@/components/popconfirm";
import dayjs from "dayjs";

const $message = useMessage();

const configStore = useConfigStore();
const userStore = useUserStore();

const modelValue = defineModel<FleetingThought>({
  required: true
});

const emits = defineEmits(["reload"]);

const platform = computed(() => {
  const platformName = modelValue.value.platform ?? "unknown";
  return {
    name: platformName,
    icon: PlatformIcon[platformName] ?? "custom-color:unknown-system"
  };
});

const browser = computed(() => {
  const browserName = modelValue.value.browser ?? "unknown";
  return {
    name: browserName,
    icon: BrowserIcon[browserName] ?? "custom-color:browser"
  };
});

const state = reactive({
  submitting: false,
  isEdit: false
});

const handleDelete = async () => {
  if (userStore.isAdmin) {
    try {
      await deleteFleetingThought(modelValue.value.id);
      $message.success("删除成功");
      emits("reload");
    } catch (error) {
      console.log(error);
      $message.error("删除失败");
    }
  }
};

const handleChangePublic = async () => {
  state.submitting = true;
  try {
    await updateFleetingThought({
      id: modelValue.value.id,
      public: modelValue.value.public
    });
  } catch (error) {
    console.error(error);
    modelValue.value.public = !modelValue.value.public;
    $message.error("操作失败");
  } finally {
    state.submitting = false;
  }
};

const handleEdit = () => {
  state.isEdit = true;
};

const handleCancelEdit = () => {
  state.isEdit = false;
};

const handelUpdate = (e: FleetingThought) => {
  modelValue.value.public = e.public;
  modelValue.value.content = e.content;
  state.isEdit = false;
};
</script>
<template>
  <div class="fleeting-thought-item">
    <div class="user">
      <div class="avatar">
        <img :src="configStore.author_card.avatar ?? '/images/avatar.webp'" alt="avatar" />
      </div>
      <div class="info">
        <div class="flex justify-between">
          <div class="flex items-center">
            <span class="nickname">{{ configStore.author_card.name }}</span>
            <div class="agent">
              <UIcon :name="platform.icon" />
              <UIcon :name="browser.icon" />
            </div>
          </div>
          <div>
            <USwitch
              v-if="userStore.isAdmin && !state.isEdit"
              v-model="modelValue.public"
              unchecked-icon="lucide:eye-closed"
              checked-icon="lucide:eye"
              :loading="state.submitting"
              @change="handleChangePublic"
            />
          </div>
        </div>
        <div class="flex">
          <div class="time">
            <div>
              <span v-if="modelValue.created_at">
                {{ dayjs(modelValue.created_at).format("YYYY年MM月DD日 HH:mm") }}
              </span>
              <span v-if="modelValue.location">
                {{ modelValue.location }}
              </span>
            </div>
          </div>
          <div class="flex gap-2">
            <span v-if="userStore.isAdmin" class="edit-btn" @click="handleEdit">
              <UIcon name="custom:edit" />
              编辑
            </span>
            <Popconfirm
              v-if="userStore.isAdmin"
              title="确认删除?"
              side="top"
              description="删除后将无法恢复"
              @confirm="handleDelete"
            >
              <span class="delete-btn">
                <UIcon name="ep:delete" />
                删除
              </span>
            </Popconfirm>
          </div>
        </div>
      </div>
    </div>
    <div class="content">
      <FleetingThoughtEditor
        v-if="userStore.isAdmin && state.isEdit"
        :data="modelValue"
        show-cancel-btn
        @cancel="handleCancelEdit"
        @updated="handelUpdate"
      />
      <TiptapRender
        v-else-if="modelValue.public || userStore.isAdmin"
        :model-value="modelValue.content"
      />
      <div v-else class="text-center text-gray-300 text-20">
        <UIcon name="custom:preview-close" />
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.fleeting-thought-item {
  background-color: var(--bg-color);
  box-shadow: var(--box-shadow);
  border-radius: var(--radius-wrap);
  padding: 1rem;

  .user {
    display: flex;
    .avatar {
      width: 46px;
      height: 46px;
      flex-shrink: 0;
      box-shadow: var(--box-shadow);
      border-radius: 50%;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
      }
    }

    .info {
      margin-left: 12px;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      .agent {
        padding-left: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        .iconify {
          width: 14px;
          height: 14px;
          margin-left: 6px;
        }
      }
      .time {
        font-size: 0.875rem;
        color: var(--text-color-3);
        display: flex;

        span {
          margin-right: 10px;
        }
      }

      .delete-btn,
      .edit-btn {
        font-size: 0.875rem;
        color: var(--text-color-3);
        user-select: none;
        cursor: pointer;
        transition: color 0.35s;

        &:hover {
          color: var(--theme-color);
        }
      }

      .delete-btn {
        &:hover {
          color: var(--red);
        }
      }
    }
  }
  .content {
    background-color: var(--bg-comment-color);
    padding: 12px;
    border-radius: 4px;
    margin-top: 12px;
    .simple-editor-render {
      background-color: inherit;

      :deep(img) {
        border: none;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .fleeting-thought-item {
    .user {
      .avatar {
        width: 32px;
        height: 32px;
      }
      .info {
        .time {
          display: flex;
          flex-wrap: wrap;
          line-height: 1.5;
          font-size: 0.75rem;
          > div {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
