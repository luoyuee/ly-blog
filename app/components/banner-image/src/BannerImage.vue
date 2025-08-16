<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  subTitle: {
    type: String,
    default: "",
  },
});
</script>
<template>
  <div class="home-picture">
    <div class="infomation" v-if="props.title || props.subTitle">
      <h1 class="title animate__animated animate__fadeIn" v-if="props.title">
        {{ props.title }}
      </h1>
      <div class="sub-title" v-if="props.subTitle">
        {{ props.subTitle }}
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.home-picture {
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

  &::after {
    content: "";
    width: 100%;
    height: 60px;
    position: absolute;
    bottom: 0;
    left: 0;
    background: linear-gradient(180deg, transparent, var(--bg-color-alpha));
    pointer-events: none;
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

      .iconfont {
        margin-right: 4px;
      }
      .iconfont:nth-child(n + 1) {
        margin-left: 12px;
      }
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
