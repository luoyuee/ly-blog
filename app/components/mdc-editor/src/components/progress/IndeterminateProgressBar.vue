<script setup lang="ts">
const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>
<template>
  <div class="indeterminate-progress-bar" v-show="props.loading">
    <div class="progress"></div>
  </div>
</template>
<style scoped lang="scss">
.indeterminate-progress-bar {
  width: 100%;
  overflow: hidden; /* 隐藏超出部分 */
  position: relative; /* 为子元素定位 */
  height: 2px; /* 进度条高度 */
  margin-bottom: -2px;

  .progress {
    height: 100%;
    background-color: #0078d4; /* 进度条颜色 */
    border-radius: inherit; /* 继承父容器的圆角 */
    position: absolute;
    left: 0;
    width: 40%; /* 初始宽度为100%，但我们会用动画改变它 */
    animation: indeterminate 2s linear infinite; /* 应用动画 */
  }

  @keyframes indeterminate {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }
}
</style>
