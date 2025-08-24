<script setup lang="ts">
import type { PropType } from "vue";
import type { ArticleComment } from "#shared/types";
import { PlatformIcon, BrowserIcon } from "#shared/constants";
import { TiptapRender } from "@/components/tiptap-editor";
import { useUserStore } from "@/stores";
import IconFont from "@/components/icon-font";
import dayjs from "dayjs";

const props = defineProps({
  data: {
    type: Object as PropType<ArticleComment>,
    required: true
  },
  direction: {
    type: String as PropType<"left" | "right">,
    default: "left"
  }
});

const emits = defineEmits(["reply", "delete"]);

const platform = computed(() => {
  const platformName = props.data.platform ?? "unknown";
  return {
    name: platformName,
    icon: PlatformIcon[platformName] ?? "custom-color:unknown-system"
  };
});

const browser = computed(() => {
  const browserName = props.data.browser ?? "unknown";
  return {
    name: browserName,
    icon: BrowserIcon[browserName] ?? "custom-color:browser"
  };
});

const handleReply = () => {
  emits("reply");
};

const userStore = useUserStore();
const handleDelete = () => {
  if (userStore.isAdmin) {
    emits("delete");
  }
};
</script>
<template>
  <div class="message-box" :class="props.direction">
    <div class="avatar">
      <img :src="props.data.avatar ?? '/images/blank_avatar.webp'" alt="avatar" />
    </div>
    <div class="message-content">
      <div class="user">
        <span class="nickname">{{ props.data.nickname }}</span>
        <div class="agent">
          <Icon :name="platform.icon" :alt="platform.name" :title="platform.name" />
          <Icon :name="browser.icon" :alt="browser.name" :title="browser.name" />
        </div>
      </div>
      <div class="message-text">
        <div v-if="props.data.reply && props.data.reply_nickname" class="reply-nickname flex-1">
          {{ "@ " + props.data.reply_nickname }}
        </div>
        <TiptapRender :model-value="props.data.content" />
      </div>
      <div class="message-footer">
        <div>
          <span v-if="props.data.created_at" class="time">
            {{ dayjs(props.data.created_at).format("YYYY年MM月DD日 HH:mm") }}
          </span>
          <span v-if="props.data.location" class="location">
            {{ props.data.location }}
          </span>
        </div>
        <div>
          <span class="reply-btn" @click="handleReply">
            <IconFont icon="icon-edit" />
            回复
          </span>
          <el-popconfirm
            v-if="userStore.isAdmin"
            title="确认删除?"
            placement="top"
            @confirm="handleDelete"
          >
            <template #reference>
              <span class="delete-btn">
                <IconFont icon="icon-delete" />
                删除
              </span>
            </template>
          </el-popconfirm>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.message-box {
  display: flex;
  .avatar {
    width: 46px;
    height: 46px;
    flex-shrink: 0;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  }
  .message-content {
    margin-right: 58px;
    margin-left: 12px;
    min-width: 60%;

    .user {
      display: flex;
      align-items: center;

      .nickname {
        color: var(--text-color-1);
      }

      .agent {
        display: flex;
        align-items: center;
        .iconify {
          width: 14px;
          height: 14px;
          margin-left: 6px;
        }
      }
    }

    .message-text {
      background-color: var(--bg-message-color);
      border-radius: 4px;
      margin: 12px 0;

      :deep(.tiptap-editor__container) {
        background-color: inherit;
      }

      .reply-nickname {
        margin-bottom: 12px;
        cursor: default;
        color: var(--theme-color);
      }
    }

    .message-footer {
      font-size: 0.875rem;
      color: var(--text-color-2);
      display: flex;

      .time,
      .location {
        margin-right: 10px;
      }

      .delete-btn,
      .reply-btn {
        user-select: none;
        cursor: pointer;
        transition: color 0.35s;

        &:hover {
          color: var(--theme-color);
        }
      }

      .delete-btn {
        margin-left: 10px;

        &:hover {
          color: var(--red);
        }
      }
    }
  }
}

.message-box.right {
  flex-direction: row-reverse;
  .message-content {
    margin-right: 12px;
    margin-left: 58px;

    .user {
      justify-content: end;
    }
  }
}

@media screen and (max-width: 768px) {
  .message-box {
    .avatar {
      width: 32px;
      height: 32px;
    }
    .message-content {
      margin-right: 0;
      .message-footer {
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
  .message-box.right {
    .message-content {
      margin-left: 0;
    }
  }
}
</style>
