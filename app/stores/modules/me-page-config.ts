import type { UpdateMePageConfigRequest } from "@/apis/config/models";
import type { IMePageConfig } from "#shared/types/config";
import { DefaultMePageConfig } from "#shared/constants/default-configs";
import { getMePageConfig, updateMePageConfig } from "@/apis/config";
import { defineStore } from "pinia";
import { AxiosError } from "axios";

export const mePageConfigStore = defineStore("me-page-config", {
  state: (): IMePageConfig => structuredClone(DefaultMePageConfig),
  actions: {
    /** 拉取独立的个人页配置，仅 `/me` 页面和设置面板需要消费该数据。 */
    async fetch() {
      const toast = useToast();

      try {
        const data = await getMePageConfig();

        this.$patch(data);
      } catch (error) {
        console.error(error);
        toast.add({
          title: "获取个人页配置失败！",
          color: "error",
          icon: "i-lucide-circle-x"
        });
      }
    },
    /** 更新独立个人页配置，并在成功后回拉一次服务端数据保持表单与页面一致。 */
    async update(data: UpdateMePageConfigRequest) {
      const toast = useToast();

      try {
        await updateMePageConfig(data);

        await this.fetch();

        toast.add({
          title: "更新个人页配置成功！",
          color: "success",
          icon: "i-lucide-circle-check"
        });
      } catch (error) {
        let description: string | undefined = undefined;

        if (error instanceof AxiosError) {
          description = error.response?.data?.message ?? error.message;
        } else if (error instanceof Error) {
          description = error.message;
        }

        toast.add({
          title: "更新个人页配置失败！",
          description,
          color: "error",
          icon: "i-lucide-circle-x"
        });
      }
    }
  }
});

export const useMePageConfigStore = () => mePageConfigStore();
