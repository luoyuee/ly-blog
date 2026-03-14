<script setup lang="ts">
import {
  ArticleSetting,
  AuthorCardSetting,
  MePageSettingCard,
  BasicSettingCard,
  BeianSettingCard,
  CzdbSettingCard,
  FleetingThoughtSettingCard,
  MessageBoardSettingCard,
  HeroSetting,
  NavMenuSetting,
  HitokotoSettingCard,
  MailerSettingCard,
  SwiperSettingCard
} from "@/components/setting-card";
import { useConfigStore, useServerConfigStore } from "@/stores";

const configStore = useConfigStore();
const serverConfigStore = useServerConfigStore();

const state = reactive({
  initializing: true
});

onMounted(() => {
  Promise.all([configStore.fetch(), serverConfigStore.fetch()]).finally(() => {
    state.initializing = false;
  });
});
</script>
<template>
  <div class="space-y-4 h-full p-4 overflow-y-auto">
    <div v-if="state.initializing" class="w-full h-full flex items-center justify-center">
      <UIcon name="i-lucide-loader-circle" :size="32" class="text-primary animate-spin" />
    </div>
    <template v-else>
      <ArticleSetting class="bg-black/30" />
      <AuthorCardSetting class="bg-black/30" />
      <MePageSettingCard class="bg-black/30" />
      <BasicSettingCard class="bg-black/30" />
      <BeianSettingCard class="bg-black/30" />
      <HeroSetting class="bg-black/30" />
      <NavMenuSetting class="bg-black/30" />
      <SwiperSettingCard class="bg-black/30" />
      <FleetingThoughtSettingCard class="bg-black/30" />
      <MessageBoardSettingCard class="bg-black/30" />
      <HitokotoSettingCard class="bg-black/30" />
      <MailerSettingCard class="bg-black/30" />
      <CzdbSettingCard class="bg-black/30" />
    </template>
  </div>
</template>
