<script setup lang="ts">
import type { AccordionItem } from "@nuxt/ui";
import type { Dayjs } from "dayjs";
import { NoticeCard, LifeCountdownCard, HitokotoCard } from "@/components/mac-card";
import { PageFooter } from "@/components/page-footer";
import { useConfigStore } from "@/stores";
import { SocialBtn, Skills, LinkCards, BaseInfoGrid, GitHubSnake } from "@/components/me";

const { $dayjs } = useNuxtApp();

const configStore = useConfigStore();

const authorAvatar = computed(() => configStore.author_card.avatar || "/images/avatar.webp");

const mePage = computed(() => configStore.me_page);

const authorLocation = computed(() => mePage.value.author.location);
const authorRole = computed(() => mePage.value.author.dev_role);
const authorDirection = computed(() => mePage.value.author.dev_direction);
const authorQuote = computed(() => mePage.value.author.quote);
const authorName = computed(() => mePage.value.author.name);

const parseStartDate = (value: string): Dayjs | null => {
  const text = value.trim();

  const parsed = $dayjs(text, ["YYYY-MM-DD", "YYYY-MM", "YYYY"], true);
  if (!parsed.isValid()) return null;

  return parsed;
};

const getAgeTextFromBirth = (birthText: string): string => {
  const birthDate = parseStartDate(birthText);
  if (!birthDate) return birthText;

  const years = $dayjs().diff(birthDate, "year");
  return String(Math.max(0, years));
};

const getWorkExperienceTextFromStart = (startText: string): string => {
  const startDate = parseStartDate(startText);
  if (!startDate) return startText;

  const years = Math.max(0, $dayjs().diff(startDate, "year"));
  return `${years}年`;
};

const baseInfo = computed(() =>
  mePage.value.intro.base_info.map((item) => {
    if (item.label === "年龄") {
      return { ...item, value: getAgeTextFromBirth(item.value) };
    }

    if (item.label === "工作经验") {
      return { ...item, value: getWorkExperienceTextFromStart(item.value) };
    }

    return item;
  })
);
const skills = computed(() => mePage.value.intro.skills);
const skillsGrid = computed(() => mePage.value.skills_grid);
const interestTags = computed(() => mePage.value.intro.interest_tags);
const languageProficiency = computed(() => mePage.value.intro.language_proficiency);
const profileTags = computed(() => mePage.value.author.tags);
const websiteLinks = computed(() => mePage.value.website_list);
const projectLinks = computed(() => mePage.value.project_list);
const socialLinks = computed(() => mePage.value.social_links);
const items = computed<AccordionItem[]>(() => mePage.value.faq_items as unknown as AccordionItem[]);
const githubSnakeLightSrc = computed(() => mePage.value.github_snake.light);
const githubSnakeDarkSrc = computed(() => mePage.value.github_snake.dark);

const tabItems = [
  { label: "Projects", slot: "projects" },
  { label: "Intro", slot: "intro" },
  { label: "FAQ", slot: "faq" }
];
</script>

<template>
  <main class="min-h-[calc(100vh-var(--header-height))] flex flex-col">
    <div class="flex-1">
      <div class="container mx-auto max-w-5xl">
        <div class="content">
          <section
            class="grid grid-cols-1 gap-5 p-5 mb-4 rounded-2xl bg-white/70 border border-black/10 shadow-sm md:grid-cols-[240px_1fr] md:items-start"
            aria-label="个人卡片"
          >
            <div class="flex flex-col gap-3 items-start">
              <img
                class="w-16 h-16 rounded-2xl object-cover bg-white shadow-[0_10px_24px_rgba(0,0,0,0.12)]"
                :src="authorAvatar"
                alt="avatar"
                loading="lazy"
              />

              <div class="w-full rounded-xl border border-black/10 bg-white/90 p-3 grid gap-2">
                <div class="flex items-center gap-2 text-[var(--text-color-2)] text-sm">
                  <UIcon name="ep:location" />
                  <span>{{ authorLocation }}</span>
                </div>
                <div class="flex items-center gap-2 text-[var(--text-color-2)] text-sm">
                  <UIcon name="ep:briefcase" />
                  <span>{{ authorRole }}</span>
                </div>
              </div>

              <div class="flex flex-wrap gap-2" aria-label="标签">
                <UBadge
                  v-for="item in profileTags"
                  :key="item.label"
                  :color="item.color"
                  variant="soft"
                  size="sm"
                >
                  {{ item.label }}
                </UBadge>
              </div>
            </div>

            <div class="min-w-0">
              <h1 class="text-[1.8rem] font-extrabold leading-[1.2] mb-2">
                Hello, I'm
                <span class="me-page__hello-name"> {{ authorName }} </span>
              </h1>

              <div class="inline-flex items-center gap-2 text-[var(--text-color-2)] text-sm">
                <UIcon name="ep:medal" class="w-4 h-4" />
                <span>{{ authorDirection }}</span>
              </div>

              <p class="mt-3 text-[0.95rem] leading-[1.8] text-[var(--text-color-2)]">
                {{ authorQuote }}
              </p>

              <div class="flex items-center gap-2 mt-3" aria-label="社交链接">
                <SocialBtn
                  v-for="(item, idx) in socialLinks"
                  :key="idx"
                  :icon="item.icon"
                  :href="item.href"
                  :hover-bg="item.hover_bg"
                >
                  {{ item.title }}
                </SocialBtn>
              </div>

              <GitHubSnake :light-src="githubSnakeLightSrc" :dark-src="githubSnakeDarkSrc" />
            </div>
          </section>

          <section
            class="p-5 rounded-2xl bg-white/70 border border-black/10 shadow-sm"
            aria-label="内容导航"
          >
            <UTabs :items="tabItems">
              <template #projects>
                <h3 class="flex items-center mt-8 mb-4 font-semibold text-xl"> 🔥 网站 </h3>
                <LinkCards :items="websiteLinks" />
                <h3 class="flex items-center mt-8 mb-4 font-semibold text-xl"> 💻 项目 </h3>
                <LinkCards :items="projectLinks" />
                <h3 class="flex items-center mt-8 mb-4 font-semibold text-xl"> ⚡ 技能 </h3>
                <Skills :data="skillsGrid" />
              </template>

              <template #intro>
                <div class="pt-4">
                  <h2
                    class="text-xl font-bold pb-2 mb-3 flex items-center border-b-2 border-[var(--text-color-5)]"
                  >
                    <UIcon class="mr-1" name="ep:user" />
                    基础信息
                  </h2>

                  <BaseInfoGrid :items="baseInfo" />
                </div>

                <div class="pt-4">
                  <h2
                    class="text-xl font-bold pb-2 mb-3 flex items-center border-b-2 border-[var(--text-color-5)]"
                  >
                    <UIcon class="mr-1" name="ep:cpu" />
                    相关技能
                  </h2>
                  <ol class="pl-5 leading-[1.9] text-[var(--text-color-2)]">
                    <li v-for="(item, idx) in skills" :key="idx" class="mb-2">
                      {{ item }}
                    </li>
                  </ol>
                </div>

                <div class="pt-4">
                  <h2
                    class="text-xl font-bold pb-2 mb-3 flex items-center border-b-2 border-[var(--text-color-5)]"
                  >
                    <UIcon class="mr-1" name="ep:star" />
                    我的兴趣
                  </h2>
                  <div class="flex flex-wrap gap-2">
                    <UBadge v-for="tag in interestTags" :key="tag" color="neutral" variant="soft">
                      {{ tag }}
                    </UBadge>
                  </div>
                </div>

                <div class="pt-4">
                  <h2
                    class="text-xl font-bold pb-2 mb-3 flex items-center border-b-2 border-[var(--text-color-5)]"
                  >
                    <UIcon class="mr-1" name="ep:chat-line-round" />
                    语言能力
                  </h2>
                  <ul class="pl-5 text-[var(--text-color-2)] leading-[1.9]">
                    <li v-for="item in languageProficiency" :key="item">
                      {{ item }}
                    </li>
                  </ul>
                </div>
              </template>

              <template #faq>
                <UAccordion
                  :items="items"
                  :ui="{
                    item: 'bg-white border rounded-lg mt-4 px-4 last:border',
                    trigger: 'cursor-pointer',
                    label: 'font-bold'
                  }"
                />
              </template>
            </UTabs>
          </section>
        </div>

        <div class="aside aside space-y-4">
          <NoticeCard />
          <LifeCountdownCard />
          <HitokotoCard />
        </div>
      </div>
    </div>

    <PageFooter class="mt-4" />
  </main>
</template>

<style scoped lang="scss">
.me-page__hello-name {
  background-image: linear-gradient(120deg, #41d1ff, #bd34fe, #e0321b, #41d1ff);
  background-size: 200% 200%;
  background-position: 100% 50%;
  animation: backgroundSizeAnimation 5s ease-in-out infinite;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

@keyframes backgroundSizeAnimation {
  0% {
    background-position: 100% 50%;
  }
  25% {
    background-position: 50% 50%;
  }
  50% {
    background-position: 0% 50%;
  }
  75% {
    background-position: 50% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}
</style>
