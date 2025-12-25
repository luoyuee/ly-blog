import { defineStore } from "pinia";
import type { ArticleCategoryItem } from "#shared/types/article";

export interface AppStoreModel {
  categoryMap: Record<string, ArticleCategoryItem>;
  lockScroll: boolean;
}

export const appStore = defineStore("app", {
  state: (): AppStoreModel => ({
    categoryMap: {},
    lockScroll: false
  })
});

export const useAppStore = () => appStore();
