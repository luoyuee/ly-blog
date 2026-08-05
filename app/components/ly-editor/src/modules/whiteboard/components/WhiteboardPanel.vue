<script setup lang="ts">
import type { PropType } from "vue";
import type { EditorTabItem, WhiteboardPanelData } from "#shared/types/ly-editor";
import type { WhiteboardContent, WhiteboardDocument } from "@/components/whiteboard";
import { Whiteboard } from "@/components/whiteboard";
import { getWhiteboardDetail, updateWhiteboard } from "@/apis/canvas-document";
import { useLogger } from "@/composables/useLogger";

const logger = useLogger();
const $notify = useNotification();

const props = defineProps({
  tab: {
    type: Object as PropType<
      EditorTabItem & { type: "whiteboard-panel"; data: WhiteboardPanelData }
    >,
    required: true,
    validator: (value: EditorTabItem) => value.type === "whiteboard-panel"
  }
});

const content = ref<WhiteboardContent>({ notes: [], strokes: [], connections: [] });
const loading = ref(false);

/** 加载白板详情（含核心数据 data） */
const loadData = async () => {
  try {
    loading.value = true;
    const detail = await getWhiteboardDetail(props.tab.data.id);

    // data 字段按 WhiteboardDocument 结构存储，取 content 作为白板内容
    const documentData = detail.data as Partial<WhiteboardDocument>;
    if (documentData?.content) {
      content.value = documentData.content;
    }
  } catch (error) {
    logger.error(error);
    $notify.error({
      title: "加载白板失败",
      error
    });
  } finally {
    loading.value = false;
  }
};

/** 保存白板数据到后端 */
const handleSave = async (document: WhiteboardDocument) => {
  try {
    await updateWhiteboard({
      id: props.tab.data.id,
      data: document as unknown as Record<string, unknown>
    });

    $notify.success({
      title: "保存成功"
    });
  } catch (error) {
    logger.error(error);
    $notify.error({
      title: "保存失败",
      error
    });
  }
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="h-full overflow-hidden">
    <Whiteboard v-model="content" @save="handleSave" />
  </div>
</template>
