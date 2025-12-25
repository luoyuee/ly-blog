<script setup lang="ts">
const colorMode = useColorMode();

const themes = [
  { value: "system", label: "自动", icon: "custom:auto-theme" },
  { value: "light", label: "浅色", icon: "custom:light" },
  { value: "dark", label: "深色", icon: "custom:dark" }
];

const currentTheme = computed({
  get: () => colorMode.preference,
  set: (value) => {
    colorMode.preference = value;
  }
});

const cycleTheme = () => {
  const index = themes.findIndex((item) => item.value === currentTheme.value);

  const nextIndex = (index + 1) % themes.length;
  if (themes[nextIndex]) {
    currentTheme.value = themes[nextIndex].value;
  }
};
</script>

<template>
  <ClientOnly>
    <template #fallback>
      <UIcon name="custom:auto-theme" :size="20" />
    </template>
    <div class="theme-switch">
      <UIcon
        v-for="theme in themes"
        :key="theme.value"
        class="theme-switch__item"
        :name="theme.icon"
        :class="{ active: currentTheme === theme.value }"
        :size="20"
        @click="cycleTheme"
      />
    </div>
  </ClientOnly>
</template>

<style scoped lang="scss">
.theme-switch {
  position: relative;
  width: 20px;
  height: 20px;

  &__item {
    position: absolute;
    transition: all 0.35s;
    transform: scale(0);
    top: 0;
    left: 0;
    cursor: pointer;

    &:hover {
      color: var(--theme-color);
    }
  }

  &__item.active {
    transform: scale(1);
  }
}
</style>
