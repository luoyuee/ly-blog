<script setup lang="ts">
type Props = {
  lightSrc?: string;
  darkSrc?: string;
};

const props = defineProps<Props>();

const shouldRender = computed(() => Boolean(props.lightSrc) && Boolean(props.darkSrc));
</script>

<template>
  <div v-if="shouldRender" class="github-snake" aria-label="GitHub Snake">
    <img
      class="github-snake__img github-snake__img--light"
      :src="props.lightSrc"
      alt="github-snake"
      loading="lazy"
    />
    <img
      class="github-snake__img github-snake__img--dark"
      :src="props.darkSrc"
      alt="github-snake-dark"
      loading="lazy"
    />
  </div>
</template>

<style scoped lang="scss">
.github-snake {
  margin: 0 -12px;
  overflow: hidden;

  &__img {
    width: 100%;
    height: auto;
    display: block;
  }

  &__img--light {
    display: block;
  }

  &__img--dark {
    display: none;
  }
}

:global(.dark) .github-snake__img--light {
  display: none;
}

:global(.dark) .github-snake__img--dark {
  display: block;
}
</style>
