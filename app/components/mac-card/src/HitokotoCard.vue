<script setup lang="ts">
import type { HitokotoItem } from "#shared/types/hitokoto";
import { randomHitokoto } from "@/apis/hitokoto";
import { useConfigStore } from "@/stores";
import { ref } from "vue";
import MacCard from "./MacCard.vue";

const configStore = useConfigStore();

const contentBorder = ref("border-1");

const hitokoto = ref("");

await useFetch<HitokotoItem>("/api/hitokoto/random", {
  method: "post",
  body: configStore.hitokoto
}).then(({ data }) => {
  if (data.value) {
    hitokoto.value = data.value.content;
  }
});

const loading = ref(false);
const handleChange = async (): Promise<void> => {
  loading.value = true;
  contentBorder.value = `border-${Math.floor(Math.random() * 6) + 1}`;
  try {
    const response = await randomHitokoto(configStore.hitokoto);
    hitokoto.value = response.content;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};
</script>
<template>
  <MacCard title="一言">
    <div class="hitokoto">
      <div class="content" :class="contentBorder">
        {{ hitokoto }}
      </div>
      <div class="change-btn" @click="handleChange">
        <UIcon name="custom:refresh" :size="26" :class="{ 'animate-spin': loading }" />
      </div>
    </div>
  </MacCard>
</template>

<style scoped lang="scss">
.hitokoto {
  .content {
    border-style: solid;
    border-color: var(--card-border-color);
    padding: 15px;
    line-height: 1.8;
    background-color: var(--card-bg-color);
    margin-bottom: 16px;
    border-width: 2px;
  }
  .content.border-1 {
    border-bottom-left-radius: 15px 255px;
    border-bottom-right-radius: 225px 15px;
    border-top-left-radius: 255px 15px;
    border-top-right-radius: 15px 225px;
  }
  .content.border-2 {
    border-bottom-left-radius: 185px 25px;
    border-bottom-right-radius: 20px 205px;
    border-top-left-radius: 125px 25px;
    border-top-right-radius: 10px 205px;
  }
  .content.border-3 {
    border-bottom-left-radius: 225px 15px;
    border-bottom-right-radius: 15px 255px;
    border-top-left-radius: 15px 225px;
    border-top-right-radius: 255px 15px;
  }
  .content.border-4 {
    border-bottom-left-radius: 25px 115px;
    border-bottom-right-radius: 155px 25px;
    border-top-left-radius: 15px 225px;
    border-top-right-radius: 25px 150px;
  }
  .content.border-5 {
    border-bottom-left-radius: 20px 115px;
    border-bottom-right-radius: 115px 20px;
    border-top-left-radius: 250px 15px;
    border-top-right-radius: 25px 80px;
  }
  .content.border-6 {
    border-bottom-left-radius: 15px 225px;
    border-bottom-right-radius: 20px 205px;
    border-top-left-radius: 28px 125px;
    border-top-right-radius: 100px 30px;
  }
  .change-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    width: fit-content;
    height: fit-content;
    padding: 8px;
    margin: 0 auto;
    cursor: pointer;
    border: 2px solid var(--text-color-5);
    color: var(--text-color-4);
  }
}
</style>
