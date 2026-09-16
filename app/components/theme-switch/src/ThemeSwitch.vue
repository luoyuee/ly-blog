<script setup lang="ts">
const { t } = useI18n();
const colorMode = useColorMode();

const themes = computed(() => [
  { value: "system", label: t("components.themeSwitch.system"), icon: "custom:auto-theme" },
  { value: "light", label: t("components.themeSwitch.light"), icon: "custom:light" },
  { value: "dark", label: t("components.themeSwitch.dark"), icon: "custom:dark" }
]);

const currentTheme = computed({
  get: () => colorMode.preference,
  set: (value) => {
    colorMode.preference = value;
  }
});

const cycleTheme = () => {
  const list = themes.value;
  const index = list.findIndex((item) => item.value === currentTheme.value);

  const nextIndex = (index + 1) % list.length;
  if (list[nextIndex]) {
    currentTheme.value = list[nextIndex].value;
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
