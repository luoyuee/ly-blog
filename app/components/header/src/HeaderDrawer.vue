<script setup lang="ts">
import type { CategoryItem } from "./types";
import { useAppStore, useConfigStore } from "@/stores";
import { useDebounceFn } from "@vueuse/core";

const configStore = useConfigStore();
const appStore = useAppStore();

const visible = defineModel<boolean>("visible", { default: false });

const autoHide = useDebounceFn(() => {
  if (window.innerWidth > 1024) {
    visible.value = false;
    window.removeEventListener("resize", autoHide);
  }
}, 100);

watch(visible, (newVal) => {
  appStore.lockScroll = newVal;
  if (newVal) {
    window.addEventListener("resize", autoHide);
  }
});

const handleClose = () => {
  visible.value = false;
};

const handleActive = (e: Event) => {
  const closeSubMenu = (menu: HTMLElement, delay = 350) => {
    setTimeout(() => {
      const subMenuList = menu.querySelectorAll("ul.sub-nav-menu");

      for (let i = 0; i < subMenuList.length; i++) {
        const parent = subMenuList[i].parentElement;

        if (parent && parent.classList.contains("active")) {
          subMenuList[i].style.height = "0px";
          parent.classList.remove("active");
        }
      }
    }, delay);
  };
  if (e.currentTarget) {
    const currentEl = e.currentTarget as HTMLLIElement;

    if (currentEl.classList.contains("active")) {
      // 关闭
      currentEl.classList.remove("active");
      const subMenu = currentEl.querySelector("ul.sub-nav-menu") as HTMLUListElement;

      if (subMenu) {
        subMenu.style.height = `${subMenu.scrollHeight}px`;

        setTimeout(() => {
          subMenu.style.height = "0px";
          closeSubMenu(subMenu);
        }, 1);
      }
    } else {
      if (currentEl.parentElement) {
        const elList = currentEl.parentElement.children;

        for (let i = 0; i < elList.length; i++) {
          if (
            elList[i] !== currentEl &&
            elList[i] instanceof HTMLLIElement &&
            elList[i].classList.contains("active") &&
            elList[i].classList.contains("nav-menu-item")
          ) {
            elList[i].classList.remove("active");
            const subMenu = elList[i].querySelector("ul.sub-nav-menu") as HTMLUListElement;

            if (subMenu) {
              subMenu.style.height = `${subMenu.clientHeight}px`;
              setTimeout(() => {
                subMenu.style.height = "0px";
                closeSubMenu(subMenu);
              }, 1);
            }
          }
        }
      }

      currentEl.classList.add("active");
      const subMenu = currentEl.querySelector("ul.sub-nav-menu") as HTMLUListElement;

      if (subMenu) {
        subMenu.style.height = `${subMenu.scrollHeight}px`;

        setTimeout(() => {
          subMenu.style.height = "auto";
        }, 350);
      }
    }
  }
};

const { data: categories } = useFetch<CategoryItem[]>("/api/article/category/root", {
  method: "get"
});
</script>
<template>
  <USlideover v-model:open="visible" side="left">
    <template #content>
      <img class="author-bg" src="/images/author_bg.jpg" alt="author_bg" />
      <div class="user">
        <img
          class="avatar"
          :src="configStore.author_card.avatar ?? '/images/avatar.webp'"
          alt="avatar"
        />
        <a class="name" :href="configStore.author_card.name_link ?? '/'">
          {{ configStore.author_card.name }}
        </a>
        <p v-if="configStore.author_card.motto" class="motto">
          {{ configStore.author_card.motto }}
        </p>
      </div>
      <ul class="nav-menu">
        <li class="nav-menu-item">
          <a href="/">
            <span>
              <UIcon name="icon-color-shouye" :size="16" />
              首页
            </span>
          </a>
        </li>
        <li class="nav-menu-item" @click="handleActive">
          <div class="sub-nav-menu-title">
            <span>
              <UIcon name="icon-color-wenjianjia" :size="16" />
              文档目录
            </span>
            <UIcon name="icon-down" class="nav-menu-arrow" />
          </div>
          <ul class="sub-nav-menu" @click.stop>
            <li v-for="item in categories" :key="item.id" class="nav-menu-item">
              <a class="item" :href="`/category/${item.id}`">
                <span>
                  <UIcon :name="item.icon ?? 'icon-color-wenjianjia'" :size="16" />
                  {{ item.name }}
                </span>
              </a>
            </li>
          </ul>
        </li>
        <li class="nav-menu-item">
          <a href="/sn">
            <span>
              <UIcon name="icon-color-zhihangshu" :size="16" />
              闪念笔记
            </span>
          </a>
        </li>
        <li class="nav-menu-item">
          <a href="/message">
            <span>
              <UIcon name="icon-color-xiaoxi" :size="16" />
              留言板
            </span>
          </a>
        </li>
        <template v-for="item in configStore.nav_menu" :key="item.id">
          <li
            v-if="item.children && item.children.length > 0 && item.show"
            class="nav-menu-item"
            @click="handleActive"
          >
            <div class="sub-nav-menu-title">
              <span>
                <UIcon :name="item.icon ?? 'icon-color-wenjianjia'" :size="16" />
                {{ item.title }}
              </span>
              <UIcon name="icon-down" class="nav-menu-arrow" />
            </div>
            <ul class="sub-nav-menu" @click.stop>
              <li v-for="sub in item.children" :key="sub.id" class="nav-menu-item">
                <a v-if="sub.show" :href="sub.href ?? '#'">
                  <span>
                    <UIcon :name="sub.icon ?? 'icon-color-lianjie'" :size="16" />
                    {{ sub.title }}
                  </span>
                </a>
              </li>
            </ul>
          </li>
          <li v-else-if="item.show" class="nav-menu-item">
            <a :href="item.href ?? '#'">
              <span>
                <UIcon :name="item.icon ?? 'icon-color-lianjie'" :size="16" />
                {{ item.title }}
              </span>
            </a>
          </li>
        </template>
      </ul>
    </template>
  </USlideover>
</template>
<style lang="scss">
@import url("../style/header-drawer.scss");
</style>
