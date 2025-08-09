<script setup lang="ts">
import { useAppStore, useConfigStore } from "@/stores";
import { useDebounceFn } from "@vueuse/core";

const configStore = useConfigStore();
const appStore = useAppStore();

const visible = defineModel("visible", { default: false });

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
      const subMenuList = menu.querySelectorAll(
        "ul.sub-nav-menu"
      ) as NodeListOf<HTMLElement>;

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
      const subMenu = currentEl.querySelector(
        "ul.sub-nav-menu"
      ) as HTMLUListElement;

      if (subMenu) {
        subMenu.style.height = subMenu.scrollHeight + "px";

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
            const subMenu = elList[i].querySelector(
              "ul.sub-nav-menu"
            ) as HTMLUListElement;

            if (subMenu) {
              subMenu.style.height = subMenu.clientHeight + "px";
              setTimeout(() => {
                subMenu.style.height = "0px";
                closeSubMenu(subMenu);
              }, 1);
            }
          }
        }
      }

      currentEl.classList.add("active");
      const subMenu = currentEl.querySelector(
        "ul.sub-nav-menu"
      ) as HTMLUListElement;

      if (subMenu) {
        subMenu.style.height = subMenu.scrollHeight + "px";

        setTimeout(() => {
          subMenu.style.height = "auto";
        }, 350);
      }
    }
  }
};

const { data: categories } = useFetch<
  { id: number; icon: string; name: string }[]
>("/api/article/category/root", {
  method: "get",
});
</script>
<template>
  <USlideover v-model:open="visible" side="left">
    <template #content>
      <div class="header-drawer">
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
          <p class="motto" v-if="configStore.author_card.motto">
            {{ configStore.author_card.motto }}
          </p>
        </div>
        <ul class="nav-menu">
          <li class="nav-menu-item">
            <a href="/">
              <span>
                <UIcon name="custom-color:home" :size="16" />
                首页
              </span>
            </a>
          </li>
          <li class="nav-menu-item" @click="handleActive">
            <div class="sub-nav-menu-title">
              <span>
                <UIcon name="custom-color:folder" :size="16" />
                文档目录
              </span>
              <UIcon name="custom:down" class="nav-menu-arrow" />
            </div>
            <ul class="sub-nav-menu" @click.stop>
              <li class="nav-menu-item" v-for="item in categories">
                <a class="item" :href="`/category/${item.id}`">
                  <span>
                    <UIcon
                      :name="item.icon ?? 'custom-color:folder'"
                      :size="16"
                    />
                    {{ item.name }}
                  </span>
                </a>
              </li>
            </ul>
          </li>
          <li class="nav-menu-item">
            <a href="/sn">
              <span>
                <UIcon name="custom-color:note" :size="16" />
                闪念笔记
              </span>
            </a>
          </li>
          <li class="nav-menu-item">
            <a href="/message">
              <span>
                <UIcon name="custom-color:message" :size="16" />
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
                  <UIcon
                    :name="item.icon ?? 'custom-color:folder'"
                    :size="16"
                  />
                  {{ item.name }}
                </span>
                <UIcon name="custom:down" class="nav-menu-arrow" />
              </div>
              <ul class="sub-nav-menu" @click.stop>
                <li
                  class="nav-menu-item"
                  v-for="sub_item in item.children"
                  :key="sub_item.id"
                >
                  <a :href="sub_item.url" v-if="sub_item.show">
                    <span>
                      <UIcon
                        :name="sub_item.icon ?? 'custom-color:lianjie'"
                        :size="16"
                      />
                      {{ sub_item.name }}
                    </span>
                  </a>
                </li>
              </ul>
            </li>
            <li class="nav-menu-item" v-else-if="item.show">
              <a :href="item.url">
                <span>
                  <UIcon
                    :name="item.icon ?? 'custom-color:lianjie'"
                    :size="16"
                  />
                  {{ item.name }}
                </span>
              </a>
            </li>
          </template>
        </ul>
      </div>
    </template>
  </USlideover>
</template>
<style lang="scss">
.header-drawer {
  padding: 0;
  display: flex;
  flex-direction: column;
  .author-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 120px;
    object-fit: cover;
    z-index: 1;
  }
  .user {
    position: relative;
    margin-top: 60px;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 24px;
    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      margin-bottom: 16px;
      object-fit: cover;
      transition: transform 0.75s;
      box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
    }
    .name {
      color: var(--theme-color);
      text-decoration: none;
      margin-bottom: 16px;
      font-size: 1.125rem;
      font-weight: 500;
    }
    .motto {
      font-size: 0.875rem;
      color: #909399;
      text-align: center;
      word-break: break-word;
    }
  }
  .nav-menu {
    list-style: none;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 20px;
    li {
      line-height: 28px;

      .nav-menu-arrow.iconfont {
        transform: rotate(-90deg);
        transition: all 0.35s;
      }
      .sub-nav-menu-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      a {
        display: flex;
        color: var(--main);
        text-decoration: none;
        font-size: 1rem;
      }

      ul {
        list-style: none;
        padding-left: 0;
        height: 0;
        width: 0;
        overflow: hidden;
        white-space: nowrap;
        transition: all 0.35s;
      }
    }
    li.active {
      ul {
        width: 100%;
        padding-left: 25px;
      }
      .nav-menu-arrow.iconfont {
        float: right;
        transform: rotate(0deg);
      }
    }
  }
}
</style>
