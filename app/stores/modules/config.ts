import type { UpdateClientConfigRequest } from "@/apis/config/models";
import type { IClientConfig } from "#shared/types/config";
import { updateClientConfig } from "@/apis/config";
import { defineStore } from "pinia";
import { AxiosError } from "axios";
import { ElNotification } from "element-plus";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

dayjs.locale("zh-cn");
dayjs.extend(relativeTime);

export const configStore = defineStore("config", {
  state: (): IClientConfig => ({
    locale: "zh-cn",
    created_at: 0,
    basic: {
      title: "",
      description: ""
    },
    author_card: {
      name: ""
    },
    external_link_card: [],
    background: {},
    swiper: [],
    nav_menu: [],
    beian: {},
    hitokoto: {},
    article: {},
    message_board: {},
    fleeting_thought: {}
  }),
  actions: {
    async fetch() {
      try {
        // const data = await getClientConfig();
        const { data } = await useFetch<IClientConfig>("/api/config/client", {
          method: "get"
        });
        if (data.value) this.$patch(data.value);
      } catch (error) {
        console.error(error);
        ElNotification.error({
          title: "获取客户端配置失败！",
          type: "error"
        });
      }
    },
    async update(data: UpdateClientConfigRequest) {
      try {
        await updateClientConfig({
          ...this.$state,
          ...data
        });

        await this.fetch();

        ElNotification.success({
          title: "更新客户端配置成功！",
          type: "success"
        });
      } catch (error) {
        let description: string | undefined = undefined;

        if (error instanceof AxiosError) {
          description = error.response?.data?.message ?? error.message;
        } else if (error instanceof Error) {
          description = error.message;
        }

        ElNotification.error({
          title: "更新客户端配置失败！",
          message: description,
          type: "error"
        });
      }
    },
    async switchLocale(locale: string) {
      const switchLocalePath = useSwitchLocalePath();
      switchLocalePath(locale as any);
    }
  }
});

export const useConfigStore = () => configStore();
