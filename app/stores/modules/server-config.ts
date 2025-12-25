import type { UpdateServerConfigRequest } from "@/apis/config/models";
import type { IServerConfig } from "#shared/types/config";
import { getServerConfig, updateServerConfig } from "@/apis/config";
import { defineStore } from "pinia";
import { AxiosError } from "axios";

export const serverConfigStore = defineStore("server-config", {
  state: (): IServerConfig => ({
    mailer: {
      tls: true,
      enable: false
    },
    storage: {}
  }),
  actions: {
    async fetch() {
      const toast = useToast();

      try {
        const data = await getServerConfig();

        this.$patch(data);
      } catch (error) {
        console.error(error);
        toast.add({
          title: "获取服务端配置失败！",
          color: "error",
          icon: "i-lucide-circle-x"
        });
      }
    },
    async update(data: UpdateServerConfigRequest) {
      const toast = useToast();

      try {
        await updateServerConfig({
          ...this.$state,
          ...data
        });

        await this.fetch();

        toast.add({
          title: "更新服务端配置成功！",
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
          title: "更新服务端配置失败！",
          description,
          color: "error",
          icon: "i-lucide-circle-x"
        });
      }
    }
  }
});

export const useServerConfigStore = () => serverConfigStore();
