import { defineStore } from "pinia";
import type { UserInfo } from "#shared/types/user";
import { UserRoleEnum } from "#shared/enums";

export interface UserStoreModel {
  userInfo?: UserInfo;
  isAdmin: boolean;
}

export const userStore = defineStore("user", {
  state: (): UserStoreModel => ({
    userInfo: undefined,
    isAdmin: false
  }),
  actions: {
    async fetchUserInfo() {
      const auth = useCookie("Authorization", {
        readonly: true,
        watch: false
      });
      if (auth) {
        try {
          const { data } = await useFetch<UserInfo>("/api/user/info");
          if (data.value) {
            this.userInfo = data.value;
            this.isAdmin = data.value.role === UserRoleEnum.ADMIN;
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  }
});

export const useUserStore = () => userStore();
