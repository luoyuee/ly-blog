<script setup lang="ts">
import { useConfigStore } from "@/stores";
import { onMounted } from "vue";
import Typed from "typed.js";

const configStore = useConfigStore();

// 在服务器端渲染时显示第一个标题
const firstTitle = configStore.background.home_sub_title
  ? configStore.background.home_sub_title.split("\n")[0]
  : "";

onMounted(() => {
  if (configStore.background.home_sub_title) {
    const _ = new Typed("#element", {
      strings: configStore.background.home_sub_title.split("\n"),
      loop: true,
      typeSpeed: 80,
      backDelay: 5000,
      backSpeed: 10,
      fadeOut: true
    });
  }
});

const handleScroll = () => {
  window.scrollTo({ top: window.innerHeight - 60, behavior: "smooth" });
};
</script>
<template>
  <div class="home-picture">
    <div class="infomation">
      <h1 class="title animate__animated animate__fadeIn">
        {{ configStore.background.home_title }}
      </h1>
      <div class="sub-title">
        <span id="element">{{ firstTitle }}</span>
      </div>
    </div>
    <div id="scroll-down" @click="handleScroll">
      <svg
        class="icon scroll-down-effects"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="4245"
        width="30"
        height="30"
      >
        <path
          d="M940.936189 483.222583l-16.813944-16.404622c-23.277146-22.642696-60.989049-22.642696-84.258009 0L511.412622 786.512121 182.958962 466.817961c-23.26896-22.642696-60.980863-22.642696-84.214007 0L81.889055 483.222583c-23.236214 22.64065-23.236214 59.349713 0 81.954547l370.436844 360.591615c0.032746 0.040932 0.067538 0.110517 0.110517 0.152473l16.84669 16.371876c23.234167 22.64065 60.946071 22.64065 84.223217 0l16.84669-16.371876c0.044002-0.040932 0.078795-0.110517 0.110517-0.152473l370.395912-360.591615C964.205149 542.572296 964.205149 505.863233 940.936189 483.222583L940.936189 483.222583z"
          fill="#FFF"
        />
      </svg>
    </div>
    <svg
      class="waves-svg"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 24 150 28"
      preserveAspectRatio="none"
      shape-rendering="auto"
    >
      <defs>
        <path
          id="gentle-wave"
          d="M -160 44 c 30 0 58 -18 88 -18 s 58 18 88 18 s 58 -18 88 -18 s 58 18 88 18 v 44 h -352 Z"
        />
      </defs>
      <g class="parallax">
        <use xlink:href="#gentle-wave" x="48" y="0" />
        <use xlink:href="#gentle-wave" x="48" y="3" />
        <use xlink:href="#gentle-wave" x="48" y="5" />
        <use xlink:href="#gentle-wave" x="48" y="7" />
      </g>
    </svg>
  </div>
</template>
<style scoped lang="scss">
.home-picture {
  background: url(/api/image/random/background) center;
  background-size: cover;
  height: 100vh;
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

  @keyframes scroll-down-effect {
    0% {
      top: 0;
      opacity: 0.4;
    }
    50% {
      top: -16px;
      opacity: 1;
      -ms-filter: none;
      filter: none;
    }
    100% {
      top: 0;
      opacity: 0.4;
    }
  }
  .scroll-down-effects {
    animation: scroll-down-effect 1.5s infinite;
  }

  .infomation {
    position: absolute;
    line-height: 1.5;
    margin-top: 0;

    .title {
      font-size: 2.25rem;
      color: var(--white);
      text-align: center;
      text-shadow: 0 3px 5px #1c1f21;
      padding: 0 1rem;
      letter-spacing: 0.25rem;
    }

    .sub-title {
      min-height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: var(--white);
      font-size: 1.125rem;
      padding: 0 1rem;
      text-shadow: 0 3px 5px #1c1f21;
      margin-top: 20px;
      letter-spacing: 1px;
    }
  }

  #scroll-down {
    position: absolute;
    bottom: 8vh;
    cursor: pointer;

    > svg {
      position: relative;
      width: 100%;
      text-align: center;
      font-size: 30px;
      line-height: 1.5;
      animation: scroll-down-effect 1.5s infinite;
      vertical-align: middle;

      @keyframes scroll-down-effect {
        0% {
          top: 0;
          opacity: 0.4;
        }
        50% {
          top: -16px;
          opacity: 1;
          -ms-filter: none;
          filter: none;
        }
        100% {
          top: 0;
          opacity: 0.4;
        }
      }
    }
  }

  .waves-svg {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3rem;
    width: 100%;
    vertical-align: middle;
  }

  .waves-svg .parallax > use {
    animation: move-forever 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
  }

  .waves-svg .parallax > use:nth-child(1) {
    animation-delay: -2s;
    animation-duration: 7s;
    fill: #ffffff;
    opacity: 0.9;
  }

  .waves-svg .parallax > use:nth-child(2) {
    -webkit-animation-delay: -3s;
    animation-delay: -3s;
    -webkit-animation-duration: 10s;
    animation-duration: 10s;
    fill: #ffffff;
    opacity: 0.8;
  }

  .waves-svg .parallax > use:nth-child(3) {
    -webkit-animation-delay: -4s;
    animation-delay: -4s;
    -webkit-animation-duration: 13s;
    animation-duration: 13s;
    fill: #ffffff;
    opacity: 0.9;
  }

  .waves-svg .parallax > use:nth-child(4) {
    -webkit-animation-delay: -5s;
    animation-delay: -5s;
    -webkit-animation-duration: 20s;
    animation-duration: 20s;
    fill: #ffffff;
  }

  @keyframes move-forever {
    0% {
      transform: translate3d(-90px, 0, 0);
    }
    100% {
      transform: translate3d(85px, 0, 0);
    }
  }
}

@media screen and (max-width: 768px) {
  .home-picture {
    .infomation {
      .title {
        font-size: 1.5rem;
      }
      .sub-title {
        font-size: 0.875rem;
      }
    }
  }
}
</style>
