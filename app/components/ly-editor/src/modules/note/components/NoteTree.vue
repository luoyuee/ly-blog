<script setup lang="ts">
import type { FolderTreeItem } from "#shared/types/ly-editor";
import { getEditorFilePath } from "@ly-editor/src/utils";
import { lyEditorEmitter } from "@/events";
import { useLyEditorModal } from "@/composables/useLyEditorModal";
import { useLyEditorStore } from "@/stores";
import { getNoteDetail } from "@/apis/note";
import dayjs from "dayjs";

const { openModal } = useLyEditorModal();
const editorStore = useLyEditorStore();

const modelValue = defineModel<FolderTreeItem[]>({
  default: () => []
});

const props = defineProps({
  depth: {
    type: Number,
    default: 0
  }
});

/**
 * 判断节点是否处于展开状态
 */
const isExpanded = (key: string): boolean => editorStore.noteManager.expandedKeys.has(key);

/**
 * 设置节点展开状态
 */
const setExpanded = (key: string, open: boolean): void => {
  const { expandedKeys } = editorStore.noteManager;
  if (open) {
    expandedKeys.add(key);
  } else {
    expandedKeys.delete(key);
  }
};

const handleClickNode = (data: FolderTreeItem): void => {
  setExpanded(data.key, !isExpanded(data.key));
};

const handleOpenFile = async (data: FolderTreeItem) => {
  if (data.type === "note") {
    try {
      const note = await getNoteDetail(data.id);

      const path = getEditorFilePath({
        name: note.name,
        folder: note.folder_id
      });

      lyEditorEmitter.emit("cmd.editor-core:open:file", {
        key: path,
        label: `${note.name}${note.extension ?? ""}`,
        isChange: false,
        openTime: dayjs().unix(),
        type: "note",
        data: {
          id: note.id,
          folder_id: note.folder_id,
          name: note.name,
          content: note.content
        }
      });
    } finally {
      setExpanded(data.key, true);
    }
  }
};

const handlePublishNote = async (data: FolderTreeItem) => {
  const result = await openModal("note-publish", data);

  if (result.action === "published") {
    lyEditorEmitter.emit("cmd.note-manager:reload");
  }
};

const handleRenameFolder = async (data: FolderTreeItem) => {
  const result = await openModal("note-folder-form", {
    id: data.id,
    parent_id: data.parent_id,
    name: data.name
  });

  if (result.action === "submitted") {
    lyEditorEmitter.emit("cmd.note-manager:reload");
  }
};
</script>
<template>
  <div class="w-full select-none text-sm">
    <template v-for="item in modelValue" :key="item.key">
      <UContextMenu
        v-if="item.type === 'note'"
        :items="[
          {
            label: '打开文件',
            icon: 'lucide:file-pen',
            color: 'primary',
            onSelect: () => {
              handleOpenFile(item);
            }
          },
          {
            label: '发布&更新文章',
            icon: 'lucide:square-arrow-out-up-right',
            onSelect: () => {
              handlePublishNote(item);
            }
          },
          {
            label: '笔记详情',
            icon: 'lucide:file-text',
            onSelect: () => {}
          },
          {
            label: '导出文件',
            icon: 'lucide:download',
            onSelect: () => {}
          },
          {
            label: '重命名',
            icon: 'lucide:text-cursor-input',
            onSelect: () => {}
          },
          {
            label: '删除笔记',
            icon: 'lucide:trash-2',
            color: 'error',
            onSelect: () => {}
          }
        ]"
        :ui="{ content: 'w-48' }"
      >
        <div
          class="hover:bg-white/10 rounded cursor-pointer flex items-center gap-1 px-1"
          @dblclick="handleOpenFile(item)"
        >
          <div :style="{ width: 24 * props.depth + 'px' }" class="flex self-stretch relative">
            <div
              v-for="(value, indent) in props.depth"
              :key="value"
              class="border-l border-slate-500/50 h-full absolute top-0"
              :style="{ left: indent * 24 + 14 + 'px' }"
            ></div>
          </div>
          <UIcon class="shrink-0 size-5 text-slate-500/50" name="mdi:dot" />
          <UIcon class="shrink-0 size-5" name="material-icon-theme:markdown" />
          <span class="truncate flex-1">{{ `${item.name}${item.data?.extension ?? ""}` }}</span>
          <UIcon class="shrink-0" name="material-symbols:square-dot-rounded" />
        </div>
      </UContextMenu>

      <div v-else-if="item.type === 'folder'" class="file-tree-item folder">
        <UCollapsible
          :open="isExpanded(item.key)"
          :unmount-on-hide="false"
          :ui="{
            content:
              'data-[state=open]:animate-[collapsible-down_100ms_ease-out] data-[state=closed]:animate-[collapsible-up_100ms_ease-out]'
          }"
          @update:open="(open) => setExpanded(item.key, open)"
        >
          <UContextMenu
            v-if="item.type === 'folder'"
            :items="[
              {
                label: '重命名',
                icon: 'lucide:text-cursor-input',
                onSelect: () => {
                  handleRenameFolder(item);
                }
              },
              {
                label: '删除文件夹',
                icon: 'lucide:trash-2',
                color: 'error',
                onSelect: () => {}
              }
            ]"
            :ui="{ content: 'w-48' }"
          >
            <div
              class="hover:bg-white/10 rounded cursor-pointer flex items-center gap-1 px-1"
              @click="handleClickNode(item)"
            >
              <div :style="{ width: 24 * props.depth + 'px' }" class="flex self-stretch relative">
                <div
                  v-for="(value, indent) in props.depth"
                  :key="value"
                  class="border-l border-slate-500/50 h-full absolute top-0"
                  :style="{ left: indent * 24 + 14 + 'px' }"
                ></div>
              </div>
              <div class="shrink-0 size-5 flex items-center justify-center">
                <UIcon
                  class="size-4 text-slate-400 transition-all duration-100"
                  :class="{ 'rotate-90': isExpanded(item.key) }"
                  name="material-symbols:arrow-forward-ios"
                />
              </div>
              <UIcon
                class="shrink-0 text-slate-400 size-5"
                :name="
                  isExpanded(item.key) ? 'material-symbols:folder-open' : 'material-symbols:folder'
                "
              />
              <span class="truncate flex-1">{{ item.name }}</span>
            </div>
          </UContextMenu>

          <template #content>
            <div class="file-tree-children transition-all overflow-hidden">
              <NoteTree v-model="item.children" :depth="props.depth + 1" />
            </div>
          </template>
        </UCollapsible>
      </div>
    </template>
  </div>
</template>
