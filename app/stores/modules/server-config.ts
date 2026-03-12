import type { UpdateServerConfigRequest } from "@/apis/config/models";
import type { IServerConfig } from "#shared/types/config";
import { getServerConfig, updateServerConfig } from "@/apis/config";
import { defineStore } from "pinia";
import { AxiosError } from "axios";

export const serverConfigStore = defineStore("server-config", {
  /**
   * 需要在初始 state 中显式声明 key：
   * - 否则即使 fetch 后通过 $patch 写入了对应的字段，依然可能出现 $state 有值但 serverConfigStore.XXX 为 undefined
   * - 显式声明可确保对应的字段始终作为响应式字段对外暴露，供设置页等场景直接访问
   */
  state: (): IServerConfig => ({
    created_at: "",
    updated_at: "",
    mailer: {
      tls: true,
      enable: false
    },
    storage: {},
    czdb: {}
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
