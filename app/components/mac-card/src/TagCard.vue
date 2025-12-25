<script setup lang="ts">
import MacCard from "./MacCard.vue";
import { getColorForTag } from "@/utils/color";
import { TagColors } from "#shared/constants";

const props = defineProps({
  data: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  colors: {
    type: Array as PropType<string[]>,
    default: () => TagColors
  },
  hrefPrefix: {
    type: String,
    default: "/tag"
  }
});
</script>
<template>
  <MacCard :title="$t('components.tagCard.title')">
    <div class="tags">
      <a
        v-for="(item, index) in props.data"
        :key="index"
        :href="`${props.hrefPrefix}/${item}`"
        :style="{ backgroundColor: getColorForTag(item, props.colors) }"
      >
        {{ item }}
      </a>
    </div>
  </MacCard>
</template>
<style scoped lang="scss">
.tags {
  a {
    color: #fff;
    padding: 3px 5px;
    font-size: 13px;
    border-radius: 3px;
    display: inline-block;
    margin-right: 4px;
    margin-bottom: 4px;
    transition: all 0.5s;
    text-decoration: none;

    &:hover {
      background-color: #000 !important;
    }
  }
}
</style>
