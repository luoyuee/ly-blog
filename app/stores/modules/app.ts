import { defineStore } from "pinia";

export interface AppStoreModel {
  lockScroll: boolean;
}

export const appStore = defineStore("app", {
  state: (): AppStoreModel => ({
    lockScroll: false
  })
});

export const useAppStore = () => appStore();
