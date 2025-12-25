<template>
  <Transition name="message-fade" @before-leave="emits('close')" @after-leave="emits('destroy')">
    <div
      v-show="visible"
      :id="id"
      ref="messageRef"
      class="basic-message"
      :class="[props.type]"
      :style="styles"
      @mouseenter="handleMouseenter"
      @mouseleave="handleMouseleave"
    >
      <UIcon class="basic-message__icon" :name="props.icon" :size="14" />
      <ContentRender class="basic-message__content" />
      <UButton
        v-if="props.showClose"
        class="basic-message__close"
        color="neutral"
        variant="link"
        icon="ep:close"
        size="sm"
        @click="close"
      />
    </div>
  </Transition>
</template>
<script setup lang="ts">
import type { PropType, VNode } from "vue";
import { onMounted, onBeforeMount, ref, computed, h, isVNode, useTemplateRef } from "vue";
import { getLastOffset, getOffsetOrSpace } from "./instance";

const props = defineProps({
  duration: {
    type: Number,
    default: 3000
  },
  message: {
    type: [String, Object, Function] as PropType<string | VNode | (() => VNode)>
  },
  icon: {
    type: String,
    default: ""
  },
  id: {
    type: String,
    default: ""
  },
  offset: {
    type: Number,
    default: 16
  },
  showClose: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    values: ["primary", "success", "info", "warning", "error"],
    default: "primary"
  },
  zIndex: {
    type: Number,
    default: 0
  }
});
const emits = defineEmits(["destroy", "close"]);

const visible = ref(false);

const lastOffset = computed(() => getLastOffset(props.id));
const offset = computed(() => getOffsetOrSpace(props.id, props.offset) + lastOffset.value);
const height = ref(0);
const bottom = computed(() => height.value + offset.value);

const ContentRender = () => {
  if (typeof props.message === "string") {
    return h("span", {}, props.message);
  } else if (typeof props.message === "object" && isVNode(props.message)) {
    return props.message;
  } else if (typeof props.message === "function") {
    return props.message();
  } else {
    return h("span", {}, "");
  }
};

const styles = computed(() => ({
  top: offset.value + "px",
  zIndex: props.zIndex
}));

let timer: ReturnType<typeof setTimeout> | null = null;

const startTimer = () => {
  if (props.duration && props.duration > 0) {
    timer = setTimeout(() => {
      resizeObserver?.disconnect();
      visible.value = false;
    }, props.duration);
  }
};

const clearTimer = () => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
};
const handleMouseenter = () => {
  clearTimer();
};

const handleMouseleave = () => {
  startTimer();
};

const close = () => {
  resizeObserver?.disconnect();
  visible.value = false;
};

let resizeObserver: ResizeObserver | null = null;

const messageRef = useTemplateRef("messageRef");

onMounted(() => {
  startTimer();
  visible.value = true;

  resizeObserver = new ResizeObserver(() => {
    height.value = messageRef.value!.getBoundingClientRect().height;
  });

  if (messageRef.value) {
    resizeObserver.observe(messageRef.value);
  }
});

onBeforeMount(() => {
  resizeObserver?.disconnect();
  clearTimer();
});

defineExpose({
  visible,
  height,
  bottom,
  close
});
</script>
<style scoped lang="scss">
.message-fade-enter-active,
.message-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.78, 0.14, 0.15, 0.86);
}

.message-fade-enter-from,
.message-fade-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.basic-message {
  width: fit-content;
  box-sizing: border-box;
  position: fixed;
  display: flex;
  gap: 0.25rem;
  align-items: center;
  left: 50%;
  top: 20px;
  z-index: 2000;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  transform: translate(-50%);
  background-color: var(--basic-message-bg-color);
  border: 1px solid var(--basic-message-border-color);
  color: var(--basic-message-text-color);
  transition:
    opacity 0.3s,
    transform 0.3s,
    top 0.3s;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

  &__icon {
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
  }
}

:deep(.basic-message__close) {
  padding: 0;
}

.basic-message.primary {
  --basic-message-bg-color: #e4f2ff;
  --basic-message-border-color: #cde7ff;
  --basic-message-text-color: #409eff;
}

.basic-message.success {
  --basic-message-bg-color: #f0f9eb;
  --basic-message-border-color: #e1f3d8;
  --basic-message-text-color: #67c23a;
}
.basic-message.info {
  --basic-message-bg-color: #f4f4f5;
  --basic-message-border-color: #e9e9eb;
  --basic-message-text-color: #909399;
}
.basic-message.warning {
  --basic-message-bg-color: #fdf6ec;
  --basic-message-border-color: #faecd8;
  --basic-message-text-color: #e6a23c;
}
.basic-message.error {
  --basic-message-bg-color: #fef0f0;
  --basic-message-border-color: #fde2e2;
  --basic-message-text-color: #f56c6c;
}
</style>
