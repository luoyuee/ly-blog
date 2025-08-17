<script setup lang="ts">
import type { PropType } from "vue";
import { isArray, isString, cloneDeep } from "lodash-es";
import { ImageSelectModal } from "@/components/image";
import IconFont from "@/components/icon-font";

const props = defineProps({
  value: {
    type: [Array, String] as PropType<string[] | string>
  },
  multiple: {
    type: Boolean
  },
  multipleLimit: {
    type: Number
  }
});

const imageList = ref<string[]>([]);

watch(
  () => props.value,
  (newVal) => {
    console.log(newVal);
    if (props.multiple) {
      if (isArray(newVal)) {
        if (props.multipleLimit) {
          imageList.value = newVal.slice(0, props.multipleLimit);
        } else {
          imageList.value = cloneDeep(newVal);
        }
      } else if (isString(newVal)) {
        imageList.value = [newVal];
      } else {
        imageList.value = [];
      }
    } else {
      if (isArray(newVal) && newVal.length > 0) {
        imageList.value = [newVal[0]];
      } else if (isString(newVal)) {
        imageList.value = [newVal];
      } else {
        imageList.value = [];
      }
    }
  },
  {
    deep: true
  }
);

const allowSelect = computed(() => {
  if (props.multiple) {
    if (props.multipleLimit && imageList.value.length >= props.multipleLimit) {
      return false;
    }
  } else if (imageList.value.length >= 1) {
    return false;
  }

  return true;
});

const imageSelectModalRef = ref<InstanceType<typeof ImageSelectModal> | null>(null);
const emits = defineEmits(["update:value"]);

const selectState = reactive<{
  multiple: boolean;
  multipleLimit?: number;
}>({
  multiple: false,
  multipleLimit: undefined
});

const clickAdd = () => {
  if (allowSelect.value && imageSelectModalRef.value) {
    if (props.multiple) {
      if (props.multipleLimit) {
        const n = props.multipleLimit - imageList.value.length;
        if (n <= 0) {
          return;
        } else if (n === 1) {
          selectState.multiple = false;
          selectState.multipleLimit = undefined;
        } else {
          selectState.multiple = true;
          selectState.multipleLimit = n;
        }
      } else {
        selectState.multiple = true;
        selectState.multipleLimit = undefined;
      }
    } else {
      selectState.multiple = false;
      selectState.multipleLimit = undefined;
    }

    imageSelectModalRef.value.show();
  }
};

const handleCheck = (images: string[]) => {
  if (!images || images.length === 0) return;

  const list: string[] = [...imageList.value, ...images];

  if (props.multiple) {
    if (props.multipleLimit) {
      emits("update:value", list.slice(0, props.multipleLimit));
    } else {
      emits("update:value", list);
    }
  } else {
    emits("update:value", images[0]);
  }
};

const handleDelete = (index: number) => {
  imageList.value.splice(index, 1);
  emits("update:value", imageList.value);
};
</script>
<template>
  <div class="image-select">
    <ul>
      <li v-for="(item, index) in imageList" :key="index">
        <img :src="item" :alt="item" />
        <span class="del-btn" @click="handleDelete(index)">
          <IconFont icon="icon-close" />
        </span>
      </li>
      <li v-if="allowSelect" class="add-btn" @click="clickAdd">
        <IconFont icon="icon-plus" />
      </li>
    </ul>
    <ImageSelectModal
      ref="imageSelectModalRef"
      :multiple="selectState.multiple"
      :multiple-limit="selectState.multipleLimit"
      @checked="handleCheck"
    />
  </div>
</template>
<style scoped lang="scss">
.image-select {
  width: 100%;

  ul {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 120px;
    gap: 6px;

    li {
      position: relative;

      &:hover {
        .del-btn {
          display: block;
        }
      }

      .del-btn {
        position: absolute;
        bottom: 0;
        right: 0;
        border-top: 18px solid rgba(0, 0, 0, 0);
        border-right: 18px solid rgba(245, 108, 108, 0.6);
        border-bottom: 18px solid rgba(245, 108, 108, 0.6);
        border-left: 18px solid rgba(0, 0, 0, 0);
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        font-size: 16px;
        display: none;
        border-bottom-right-radius: 4px;

        &:hover {
          border-right: 18px solid rgba(245, 108, 108, 0.8);
          border-bottom: 18px solid rgba(245, 108, 108, 0.8);
        }

        .iconfont {
          position: absolute;
          bottom: -14px;
          right: -14px;
        }
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
        overflow: hidden;
      }
    }

    .add-btn {
      border: 1px solid #dde0e7;
      border-radius: 4px;
      font-size: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f7fa;
      cursor: pointer;
      user-select: none;
    }
  }
}
</style>
