import type { UpdateClientConfigRequest } from "@/apis/config/models";
import type { IClientConfig, IClientConfigLocale } from "#shared/types/config";
import { updateClientConfig } from "@/apis/config";
import { defineStore } from "pinia";
import { AxiosError } from "axios";

export const configStore = defineStore("config", {
  state: (): IClientConfig => ({
    locale: "zh-CN",
    created_at: "",
    updated_at: "",
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
    fleeting_thought: {},
    me_page: {
      author: {
        name: "",
        avatar: "",
        location: "",
        dev_role: "",
        dev_direction: "",
        quote: "",
        tags: []
      },
      github_snake: {
        light: "",
        dark: ""
      },
      intro: {
        base_info: [],
        skills: [],
        interest_tags: [],
        language_proficiency: []
      },
      skills_grid: [],
      website_list: [],
      project_list: [],
      social_links: [],
      faq_items: []
    },
    live2d: {}
  }),
  actions: {
    async fetch() {
      try {
        const { data } = await useFetch<IClientConfig>("/api/config/client", {
          method: "get",
          key: new Date().getTime().toString()
        });
        if (data.value) this.$patch(data.value);
      } catch (error) {
        console.error(error);

        const toast = useToast();
        toast.add({
          title: "获取客户端配置失败！",
          color: "error",
          icon: "i-lucide-circle-x"
        });
      }
    },
    async update(data: UpdateClientConfigRequest) {
      const toast = useToast();

      try {
        await updateClientConfig({
          ...this.$state,
          ...data
        });

        await this.fetch();

        toast.add({
          title: "更新客户端配置成功！",
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
          title: "更新客户端配置失败！",
          description,
          color: "error",
          icon: "i-lucide-circle-x"
        });
      }
    },
    async switchLocale(locale: IClientConfigLocale) {
      const switchLocalePath = useSwitchLocalePath();
      switchLocalePath(locale);
    }
  }
});

export const useConfigStore = () => configStore();
