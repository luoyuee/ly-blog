<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useNoticeStore } from "@/stores";
import { getNoticeConfig } from "@/apis/config";

const noticeStore = useNoticeStore();

const noticeModalVisible = ref(false);

/**
 * 本地存储中用于记录公告内容的 key
 */
const NOTICE_MODAL_CONTENT_KEY = "notice_modal_content";

/**
 * 会话存储中用于记录当前访问是否已关闭公告的 key
 */
const NOTICE_MODAL_SESSION_KEY = "notice_modal_closed";

/**
 * 会话存储中用于记录当前访问是否已关闭公告 toast 的 key
 */
const NOTICE_TOAST_SESSION_KEY = "notice_toast_closed";

/**
 * 处理“不再打开”按钮点击事件
 */
const handleNoticeNeverOpen = (): void => {
  if (noticeStore.modal.content) {
    window.localStorage.setItem(NOTICE_MODAL_CONTENT_KEY, noticeStore.modal.content);
  } else {
    window.localStorage.removeItem(NOTICE_MODAL_CONTENT_KEY);
  }

  noticeModalVisible.value = false;
};

/**
 * 监听公告弹窗的显示状态
 * 在用户关闭弹窗后，本次访问不再自动打开
 */
watch(
  () => noticeModalVisible.value,
  (visible) => {
    if (!visible) {
      window.sessionStorage.setItem(NOTICE_MODAL_SESSION_KEY, "1");
    }
  }
);

/**
 * 初始化公告配置并控制弹窗展示逻辑
 */
onMounted(() => {
  getNoticeConfig().then((res) => {
    noticeStore.setConfig(res);

    // toast 公告
    if (noticeStore.toast.content) {
      const toast = useToast();

      setTimeout(() => {
        const sessionClosed = window.sessionStorage.getItem(NOTICE_TOAST_SESSION_KEY) === "1";

        if (!sessionClosed) {
          toast.add({
            title: "网站公告",
            icon: "lucide:bell",
            description: noticeStore.toast.content,
            duration: 0,
            "onUpdate:open": (open) => {
              if (!open) {
                window.sessionStorage.setItem(NOTICE_TOAST_SESSION_KEY, "1");
              }
            }
          });
        }
      }, noticeStore.toast.delay);
    }

    // modal 公告
    if (noticeStore.modal.content) {
      const storedContent = window.localStorage.getItem(NOTICE_MODAL_CONTENT_KEY);

      setTimeout(() => {
        const sessionClosed = window.sessionStorage.getItem(NOTICE_MODAL_SESSION_KEY) === "1";

        noticeModalVisible.value = !sessionClosed && storedContent !== noticeStore.modal.content;
      }, noticeStore.toast.delay);
    }
  });
});
</script>
<template>
  <UModal
    v-model:open="noticeModalVisible"
    :fullscreen="noticeStore.modal.fullscreen"
    :overlay="false"
    :ui="{
      header: 'p-3 sm:px-3 min-h-12',
      close: 'top-2 end-2',
      body: 'min-h-24',
      footer: 'justify-end p-3 sm:px-3'
    }"
    modal
  >
    <template #title>
      <div class="flex items-center">
        <UIcon name="lucide:bell" class="text-primary mr-2" :size="20" />
        <span>网站公告</span>
      </div>
    </template>
    <template #body>
      {{ noticeStore.modal.content }}
    </template>
    <template #footer="{ close }">
      <UButton label="不再打开" variant="outline" @click="handleNoticeNeverOpen" />
      <UButton label="确认" color="primary" @click="close" />
    </template>
  </UModal>
</template>
