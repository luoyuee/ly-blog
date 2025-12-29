import type { NoticeConfig } from "#shared/types/config";
import { defineStore } from "pinia";

export const noticeStore = defineStore("notice", {
  state: (): NoticeConfig => ({
    card: {
      content: ""
    },
    toast: {
      content: "",
      delay: 0,
      position: ""
    },
    modal: {
      content: "",
      delay: 0,
      fullscreen: false
    }
  }),
  actions: {
    setConfig(config: NoticeConfig) {
      this.$patch(config);
    }
  }
});

export const useNoticeStore = () => noticeStore();
