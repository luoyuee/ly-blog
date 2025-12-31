<script setup lang="ts">
import type { PropType } from "vue";
import type { ArticleComment } from "#shared/types/article";
import { PlatformIcon, BrowserIcon } from "#shared/constants";
import { TiptapRender } from "@/components/tiptap-editor";
import { useUserStore } from "@/stores";
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
  <div class="comment-box" :class="props.direction">
    <div class="avatar">
      <img :src="props.data.avatar ?? '/images/blank_avatar.webp'" alt="avatar" />
    </div>
    <div class="comment-content">
      <div class="user">
        <span class="nickname">{{ props.data.nickname }}</span>
        <div class="agent">
          <UIcon :name="platform.icon" />
          <UIcon :name="browser.icon" />
        </div>
      </div>
      <div class="comment-text">
        <div v-if="props.data.reply_id && props.data.reply_nickname" class="reply-nickname flex-1">
          {{ "@ " + props.data.reply_nickname }}
        </div>
        <TiptapRender :model-value="props.data.content" />
      </div>
      <div class="comment-footer">
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
            <UIcon name="custom:edit" />
            回复
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
</template>
<style scoped lang="scss">
.comment-box {
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
  .comment-content {
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
        padding-left: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }

    .comment-text {
      background-color: var(--bg-comment-color);
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

    .comment-footer {
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
        display: inline-flex;
        align-items: center;
        gap: 2px;

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

.comment-box.right {
  flex-direction: row-reverse;
  .comment-content {
    margin-right: 12px;
    margin-left: 58px;

    .user {
      justify-content: end;
    }
  }
}

@media screen and (max-width: 768px) {
  .comment-box {
    .avatar {
      width: 32px;
      height: 32px;
    }
    .comment-content {
      margin-right: 0;
      .comment-footer {
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
  .comment-box.right {
    .comment-content {
      margin-left: 0;
    }
  }
}
</style>
