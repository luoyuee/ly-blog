<script setup lang="ts">
import MacCard from "./MacCard.vue";

const props = defineProps({
  data: {
    type: Array as PropType<string[]>,
    default: [],
  },
  colors: {
    type: Array as PropType<string[]>,
    default: () => [
      "#6fa3ef",
      "#bc99c4",
      "#4C83FF",
      "#FF52E5",
      "#5151E5",
      "#FA742B",
      "#f093fb",
      "#32CCBC",
      "#f9bb3c",
      "#F067B4",
      "#28C76F",
      "#F6416C",
    ],
  },
  hrefPrefix: {
    type: String,
    default: "/tag",
  },
});

const randomColor = (): string => {
  const index = Math.floor(Math.random() * props.colors.length);
  return props.colors[index];
};
</script>
<template>
  <MacCard :title="$t('components.tagCard.title')">
    <div class="tags">
      <a
        v-for="(item, index) in props.data"
        :key="index"
        :href="`${props.hrefPrefix}/${item}`"
        :style="{ backgroundColor: randomColor() }"
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
