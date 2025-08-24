<script setup lang="ts">
import type { GetMessagePaginatedResponse } from "@/apis/message/models";
import type { MessageItem } from "#shared/types/message";
import { deleteMessage, getPaginatedMessages } from "@/apis/message";
import MessageListItem from "./MessageListItem.vue";
import MessageEditor from "./MessageEditor.vue";

const state = reactive<{
  page: number;
  per_page: number;
  total: number;
  loading: boolean;
}>({
  page: 1,
  per_page: 10,
  total: 0,
  loading: false
});

const messages = ref<MessageItem[]>([]);

await useFetch<GetMessagePaginatedResponse>("/api/message", {
  method: "get",
  params: {
    page: state.page,
    per_page: state.per_page
  }
}).then((response) => {
  if (response.data.value) {
    const data = response.data.value;

    messages.value = data.data;
    state.page = data.page;
    state.total = data.total;
  }
});

const loadData = async () => {
  try {
    state.loading = true;

    const response = await getPaginatedMessages({
      page: state.page,
      per_page: state.per_page
    });

    messages.value = response.data;
    state.page = response.page;
    state.total = response.total;
  } catch (error) {
    console.error(error);
    ElMessage.error("加载数据失败");
  } finally {
    state.loading = false;
  }
};

const handleReload = () => {
  state.page = 1;
  loadData();
};

const reply = reactive<{
  id?: number;
  nickname?: string;
}>({
  id: undefined,
  nickname: undefined
});

const handleReply = (parent: number, e: MessageItem) => {
  reply.id = parent;
  reply.nickname = e.nickname;
};

const handleSubmitted = () => {
  handleRemoveEditor();
  loadData();
};

const handleRemoveEditor = () => {
  reply.id = undefined;
  reply.nickname = undefined;
};

const messageBoardRef = ref<HTMLDivElement | null>(null);

const handleChangePage = () => {
  if (messageBoardRef.value) {
    window.scrollTo({
      top: messageBoardRef.value.offsetTop,
      behavior: "smooth"
    });
  }
  loadData();
};

const handleDelete = async (id: number) => {
  try {
    await deleteMessage(id);
    ElMessage.success("删除成功");
    loadData();
  } catch (error) {
    console.error(error);
    ElMessage.error("删除失败");
  }
};
</script>
<template>
  <div class="message-board">
    <MessageEditor :show-cancel-btn="false" @submitted="handleReload" />

    <ul v-loading="state.loading" class="message-list">
      <li v-for="item in messages" :key="item.id" class="message-list-item">
        <MessageListItem
          :data="item"
          @reply="handleReply(item.id, item)"
          @delete="handleDelete(item.id)"
        />

        <Transition name="message-board-editor">
          <MessageEditor
            v-if="item.id === reply.id"
            class="mt-4"
            :parent-id="item.id"
            :reply-id="reply.id"
            :reply-nickname="reply.nickname"
            @submitted="handleSubmitted"
            @cancel="handleRemoveEditor"
          />
        </Transition>

        <ul v-if="item.children" class="message-sub-list">
          <li v-for="subItem in item.children" :key="subItem.id" class="message-sub-list-item">
            <MessageListItem
              :data="subItem"
              direction="right"
              @reply="handleReply(subItem.id, subItem)"
              @delete="handleDelete(subItem.id)"
            />
            <Transition name="message-board-editor">
              <MessageEditor
                v-if="subItem.id === reply.id"
                class="mt-4"
                :parent="item.id"
                :reply="reply.id"
                :reply-nickname="reply.nickname"
                @submitted="handleSubmitted"
                @cancel="handleRemoveEditor"
              />
            </Transition>
          </li>
        </ul>
      </li>
    </ul>

    <div class="mt-4 flex justify-end">
      <el-pagination
        v-model:current-page="state.page"
        background
        layout="prev, pager, next"
        :total="state.total"
        :page-size="state.per_page"
        hide-on-single-page
        @current-change="handleChangePage"
      />
    </div>
  </div>
</template>
<style scoped lang="scss">
.message-board {
  .message-board-editor-enter-active,
  .message-board-editor-leave-active {
    transition:
      opacity 0.35s ease,
      transform 0.35s ease;
  }

  .message-board-editor-enter-from,
  .message-board-editor-leave-to {
    opacity: 0;
    transform: scale(0);
  }
  .message-list {
    list-style: none;
    .message-list-item {
      background-color: var(--box-bg-color);
      padding: 20px;
      box-shadow: var(--box-shadow);
      border-radius: var(--radius-wrap);
      margin-top: 16px;
      transition: all 0.35s;
    }

    .message-sub-list {
      list-style: none;
      .message-sub-list-item {
        margin-top: 16px;
      }
    }
  }
}
</style>
