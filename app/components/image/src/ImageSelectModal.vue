<script setup lang="ts">
import type { ImageFolder, ImageItem } from "#shared/types/image";
import type { ScrollbarInstance } from "element-plus";
import { getAllImageFolder, getPaginatedImages } from "@/apis/image";
import { Search } from "@element-plus/icons-vue";
import IconFont from "@/components/icon-font";
import UploadModal from "./UploadModal.vue";

const emits = defineEmits(["checked"]);

const props = defineProps({
  multiple: {
    type: Boolean
  },
  multipleLimit: {
    type: Number
  },
  title: {
    type: String,
    default: "选择图片"
  }
});

const state = reactive<{
  visible: boolean;
  uploadModalVisible: boolean;
  currentFolder: number;
  page: number;
  per_page: number;
  total: number;
  more: boolean;
  loading: boolean;
}>({
  visible: false,
  uploadModalVisible: false,
  currentFolder: 0,
  page: 1,
  per_page: 20,
  total: 0,
  more: true,
  loading: false
});

const imageFolder = ref<ImageFolder[]>([]);
const imageList = ref<ImageItem[]>([]);

type CheckObjVal = Record<number, { index: number }>;

const checkMap: Map<number, ImageItem> = new Map();
const checkObj = ref<CheckObjVal>({});
const checkList = ref<ImageItem[]>([]);
const checkQty = ref(0);

const maxQty = computed(() => {
  if (props.multiple) {
    return props.multipleLimit;
  } else {
    return 1;
  }
});

const syncCheckData = () => {
  const obj: CheckObjVal = {};
  const list: ImageItem[] = [];

  let index = 1;

  checkMap.forEach((val, key) => {
    list.push(val);
    obj[key] = { index };
    index++;
  });

  checkList.value = list;
  checkObj.value = obj;

  checkQty.value = checkMap.size;
};

const show = async () => {
  state.visible = true;
  checkMap.clear();
  syncCheckData();

  try {
    imageFolder.value = await getAllImageFolder();
    if (imageFolder.value.length > 0) {
      state.currentFolder = imageFolder.value[0].id;
    }
    getData();
  } catch (error) {
    ElMessage.error("获取数据失败");
  }
};

const getData = async (): Promise<void> => {
  if (!state.currentFolder) return;

  try {
    state.loading = true;
    const response = await getPaginatedImages(state.currentFolder, {
      page: state.page,
      per_page: state.per_page
    });

    imageList.value = imageList.value.concat(response.data);
    state.total = response.total;

    state.more = state.page < Math.ceil(response.total / state.per_page);
    state.page += 1;

    nextTick(() => {
      if (elScrollbarRef.value && elScrollbarRef.value.wrapRef) {
        const viewEl = elScrollbarRef.value.wrapRef.querySelector(".el-scrollbar__view");
        if (viewEl) {
          const viewHeight = viewEl.clientHeight;

          // 递归获取图片，知道没有更多内容，或铺满视图
          if (elScrollbarRef.value.wrapRef.clientHeight > viewHeight && state.more) {
            getData();
          }
        }
      }
    });
  } catch (error) {
    ElMessage.error("获取图片失败");
  } finally {
    state.loading = false;
  }
};

const elScrollbarRef = ref<ScrollbarInstance | null>(null);
const handleScroll = (e: { scrollLeft: number; scrollTop: number }) => {
  if (state.more && elScrollbarRef.value && elScrollbarRef.value.wrapRef) {
    const viewEl = elScrollbarRef.value.wrapRef.querySelector(".el-scrollbar__view");

    if (viewEl) {
      const viewHeight = viewEl.clientHeight;
      // 距离底部30像素时加载更多
      if (viewHeight - elScrollbarRef.value.wrapRef.clientHeight - e.scrollTop < 30) {
        getData();
      }
    }
  }
};

const changeFolder = (id: number) => {
  imageList.value = [];
  state.currentFolder = id;
  state.page = 1;
  state.total = 0;
  state.more = true;
  getData();
};

const handleReload = () => {
  imageList.value = [];
  state.page = 1;
  state.total = 0;
  state.more = true;
  getData();
};

const showUploadModal = () => {
  state.uploadModalVisible = true;
};

const handleCheck = (e: ImageItem) => {
  if (props.multiple && props.multipleLimit) {
    if (checkMap.size >= props.multipleLimit) return;
  }

  if (checkMap.has(e.id)) {
    checkMap.delete(e.id);
  } else {
    if (!props.multiple) checkMap.clear();
    checkMap.set(e.id, e);
  }

  syncCheckData();
};

const handleDelete = (e: ImageItem) => {
  if (checkMap.has(e.id)) {
    checkMap.delete(e.id);
  }

  syncCheckData();
};

const handleConfirm = () => {
  const list: string[] = [];
  checkMap.forEach((val, key) => {
    list.push(val.url);
  });

  emits("checked", list);
  state.visible = false;
};

defineExpose({
  show
});
</script>
<template>
  <el-dialog v-model="state.visible" :title="props.title" class="image-select-modal">
    <div class="box">
      <ul class="tab-bar">
        <li
          v-for="item in imageFolder"
          :key="item.id"
          :class="{ active: item.id === state.currentFolder }"
          @click="changeFolder(item.id)"
        >
          {{ item.name }}
        </li>
      </ul>
      <div class="image-list">
        <div class="flex justify-between items-center mb-2">
          <el-space>
            <el-button @click="showUploadModal"> 上传 </el-button>
            <el-button @click="handleReload"> 刷新 </el-button>
          </el-space>
          <el-input placeholder="搜索图片标签" style="width: 50%; min-width: 200px">
            <template #append>
              <el-button :icon="Search" />
            </template>
          </el-input>
        </div>
        <el-scrollbar v-if="imageList.length > 0" ref="elScrollbarRef" @scroll="handleScroll">
          <ul class="image-select-list">
            <li v-for="item in imageList" :key="item.id">
              <span
                class="checkbox"
                :class="{ 'is-checked': checkObj[item.id] }"
                @click="handleCheck(item)"
              >
                <IconFont icon="icon-check" />
              </span>
              <img :src="item.preview" />
            </li>
          </ul>
        </el-scrollbar>
        <div v-else class="flex-1 flex justify-center items-center">
          <img src="/images/no_pictures.svg" alt="empty" width="200" />
        </div>
      </div>
    </div>
    <ul v-if="props.multiple" class="selected-list">
      <li v-for="(item, index) in checkList" :key="index">
        <span class="checkbox" @click="handleDelete(item)">
          <IconFont icon="icon-close-small" />
        </span>
        <img :src="item.preview" />
      </li>
    </ul>
    <template #footer>
      <div class="flex justify-between items-center">
        <span>{{ `选择（${checkQty}${maxQty ? "/" + maxQty : ""}）` }}</span>
        <el-space>
          <el-button>取消</el-button>
          <el-button type="primary" @click="handleConfirm">确认</el-button>
        </el-space>
      </div>
    </template>
  </el-dialog>
  <UploadModal
    v-model:visible="state.uploadModalVisible"
    :folder="state.currentFolder"
    @uploaded="handleReload"
  />
</template>
<style lang="scss">
.el-dialog.image-select-modal {
  padding: 0;
  .el-dialog__header {
    padding: 0 16px;
    margin: 0;
    border-bottom: 1px solid var(--el-border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 48px;
  }
  .el-dialog__body {
    padding: 0;
    .box {
      display: flex;
      height: 400px;
      > div {
        height: 100%;
      }
      .tab-bar {
        width: 120px;
        flex-shrink: 0;
        border-right: 1px solid var(--el-border-color);
        list-style: none;
        position: relative;

        li {
          height: 40px;
          line-height: 40px;
          font-size: 1rem;
          text-align: center;
          user-select: none;
          cursor: pointer;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          padding: 0 8px;
          transition: all 0.35s;
          &:hover {
            color: var(--el-color-primary);
          }
        }
        li.active {
          color: var(--el-color-primary);
        }
      }
      .image-list {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 8px;

        .image-select-list {
          list-style: none;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 4px;
          li {
            position: relative;
            cursor: default;
            border-radius: 4px;
            overflow: hidden;

            &:hover {
              .checkbox {
                display: block;
              }
            }

            .checkbox {
              position: absolute;
              bottom: 0;
              right: 0;
              border-top: 18px solid rgba(0, 0, 0, 0);
              border-right: 18px solid rgba(255, 255, 255, 0.6);
              border-bottom: 18px solid rgba(255, 255, 255, 0.6);
              border-left: 18px solid rgba(0, 0, 0, 0);
              cursor: pointer;
              font-size: 16px;
              color: rgba(0, 0, 0, 0.8);
              display: none;

              &:hover {
                border-right: 18px solid rgba(255, 255, 255, 0.8);
                border-bottom: 18px solid rgba(255, 255, 255, 0.8);
              }
              .iconfont {
                position: absolute;
                bottom: -14px;
                right: -14px;
              }
            }
            .checkbox.is-checked {
              border-top: 16px solid rgba(0, 0, 0, 0);
              border-right: 16px solid rgba(103, 194, 58, 0.8);
              border-bottom: 16px solid rgba(103, 194, 58, 0.8);
              border-left: 16px solid rgba(0, 0, 0, 0);
              color: rgba(255, 255, 255, 0.8);
              display: block;
            }
            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }
        }
      }
    }
    .selected-list {
      height: 140px;
      border-top: 1px solid var(--el-border-color);
      list-style: none;
      display: flex;
      align-items: center;
      gap: 6px;
      overflow-x: auto;
      overflow-y: hidden;

      &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background-color: #0003;
        border-radius: 10px;
        transition: all 0.2s ease-in-out;
      }
      &::-webkit-scrollbar-track {
        border-radius: 10px;
      }
      li {
        height: 120px;
        position: relative;

        &:hover {
          .checkbox {
            display: block;
          }
        }

        .checkbox {
          position: absolute;
          bottom: 0;
          right: 0;
          border-top: 18px solid rgba(0, 0, 0, 0);
          border-right: 18px solid rgba(245, 108, 108, 0.6);
          border-bottom: 18px solid rgba(245, 108, 108, 0.6);
          border-left: 18px solid rgba(0, 0, 0, 0);
          cursor: pointer;
          font-size: 16px;
          color: rgba(255, 255, 255, 0.8);
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
          height: 100%;
          object-fit: cover;
          border-radius: 4px;
          overflow: hidden;
        }
      }
    }
  }
  .el-dialog__footer {
    padding: 10px 16px;
    border-top: 1px solid var(--el-border-color);
  }
}
</style>
