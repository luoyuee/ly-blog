import { defineStore } from "pinia";
import type { Profile } from "#shared/types/user";

export interface UserStoreModel {
  profile?: Profile;
}

export const userStore = defineStore("user", {
  state: (): UserStoreModel => ({
    profile: undefined
  }),
  actions: {
    async fetchProfile() {
      const auth = useCookie("Authorization", {
        readonly: true,
        watch: false
      });

      if (!auth.value) return;

      try {
        const { data } = await useFetch<Profile>("/api/user/info", {
          key: new Date().getTime().toString()
        });

        if (data.value) {
          this.profile = data.value;
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
});

export const useUserStore = () => userStore();
