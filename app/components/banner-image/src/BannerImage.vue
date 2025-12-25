<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    default: ""
  },
  subTitle: {
    type: String,
    default: ""
  }
});
</script>
<template>
  <div class="category-banner">
    <div v-if="props.title || props.subTitle" class="category-banner__content">
      <h1 v-if="props.title" class="category-banner__title animate__animated animate__fadeIn">
        {{ props.title }}
      </h1>
      <div v-if="props.subTitle" class="category-banner__subtitle">
        {{ props.subTitle }}
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.category-banner {
  background: url(/api/image/random/background) center;
  background-size: cover;
  height: 50vh;
  position: relative;
  margin-top: calc(0px - var(--header-height));
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding-bottom: 0;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.2);
    pointer-events: none;
  }

  &__content {
    position: absolute;
    line-height: 1.5;
    margin-top: 0;
  }

  &__title {
    font-size: 2.25rem;
    color: var(--white);
    text-align: center;
    text-shadow: var(--hero-text-shadow);
    padding: 0 1rem;
    letter-spacing: 0.25rem;
  }

  &__subtitle {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: var(--white);
    font-size: 1.125rem;
    padding: 0 1rem;
    text-shadow: var(--hero-text-shadow);
    margin-top: 1.25rem;
    letter-spacing: 1px;
  }
}

@media screen and (max-width: 768px) {
  .category-banner {
    &__title {
      font-size: 1.5rem;
    }

    &__subtitle {
      font-size: 0.875rem;
    }
  }
}
</style>
