<script setup lang="ts">
import type { FolderTreeItem } from "#shared/types/ly-editor";
import { getEditorFilePath } from "../../utils";
import { lyEditorEmitter } from "@/events";
import { getNoteDetail } from "@/apis/note";
import dayjs from "dayjs";

const modelValue = defineModel<FolderTreeItem[]>({
  default: () => []
});

const props = defineProps({
  depth: {
    type: Number,
    default: 0
  }
});

const handleClickNode = (data: FolderTreeItem): void => {
  data.is_expanded = !data.is_expanded;
};

const handleOpenFile = async (data: FolderTreeItem) => {
  console.log(data);
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
      data.is_expanded = true;
    }
  }
};

const handlePublishNote = (data: FolderTreeItem) => {
  console.log(data);
  lyEditorEmitter.emit("cmd.note-manager:publish:article", data);
};
</script>
<template>
  <div class="w-full select-none">
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
          class="hover:bg-gray-800 rounded cursor-pointer flex items-center"
          :style="{ 'padding-left': 20 * props.depth + 'px' }"
          @dblclick="handleOpenFile(item)"
        >
          <UIcon class="mx-1 shrink-0" name="custom-color:markdown" />
          <span class="truncate flex-1">{{ `${item.name}${item.data?.extension ?? ""}` }}</span>
          <UIcon class="mx-1 shrink-0" name="material-icon-theme:label" />
        </div>
      </UContextMenu>

      <div v-else-if="item.type === 'folder'" class="file-tree-item folder">
        <UCollapsible
          v-model:open="item.is_expanded"
          :unmount-on-hide="false"
          :ui="{
            content:
              'data-[state=open]:animate-[collapsible-down_100ms_ease-out] data-[state=closed]:animate-[collapsible-up_100ms_ease-out]'
          }"
        >
          <UContextMenu
            v-if="item.type === 'folder'"
            :items="[
              {
                label: '重命名',
                icon: 'lucide:text-cursor-input',
                onSelect: () => {
                  lyEditorEmitter.emit('intent.note-manager:rename:folder', {
                    id: item.id,
                    parent_id: item.parent_id,
                    name: item.name
                  });
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
              class="hover:bg-gray-800 rounded cursor-pointer flex items-center"
              :style="{ 'padding-left': 20 * props.depth + 'px' }"
              @click="handleClickNode(item)"
            >
              <UIcon
                class="mx-1 shrink-0 text-slate-400"
                :name="
                  item.is_expanded ? 'material-symbols:folder-open' : 'material-symbols:folder'
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
