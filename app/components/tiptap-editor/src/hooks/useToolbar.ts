import type { Editor } from "@tiptap/vue-3";
import type { ToolbarItem } from "../types";
import type { ShallowRef } from "vue";
import { computed } from "vue";

export const useToolbar = (editor: ShallowRef<Editor | undefined>) => {
  const toolbarItems = computed<ToolbarItem[]>(() => {
    if (!editor.value) return [];

    return [
      {
        type: "button",
        name: "undo",
        icon: "ri:arrow-go-back-line",
        title: "撤销",
        action: () => editor.value?.chain().focus().undo().run(),
        isActive: () => false
      },
      {
        type: "button",
        name: "redo",
        icon: "ri:arrow-go-forward-line",
        title: "重做",
        action: () => editor.value?.chain().focus().redo().run(),
        isActive: () => false
      },
      {
        type: "divider"
      },
      {
        type: "button",
        name: "heading1",
        icon: "ri:h-1",
        title: "标题1",
        action: () => editor.value?.chain().focus().toggleHeading({ level: 1 }).run(),
        isActive: () => !!editor.value?.isActive("heading", { level: 1 })
      },
      {
        type: "button",
        name: "heading2",
        icon: "ri:h-2",
        title: "标题2",
        action: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: () => !!editor.value?.isActive("heading", { level: 2 })
      },
      {
        type: "button",
        name: "heading3",
        icon: "ri:h-3",
        title: "标题3",
        action: () => editor.value?.chain().focus().toggleHeading({ level: 3 }).run(),
        isActive: () => !!editor.value?.isActive("heading", { level: 3 })
      },
      {
        type: "divider"
      },
      {
        type: "button",
        name: "bold",
        icon: "ri:bold",
        title: "粗体",
        action: () => editor.value?.chain().focus().toggleBold().run(),
        isActive: () => !!editor.value?.isActive("bold")
      },
      {
        type: "button",
        name: "italic",
        icon: "ri:italic",
        title: "斜体",
        action: () => editor.value?.chain().focus().toggleItalic().run(),
        isActive: () => !!editor.value?.isActive("italic")
      },
      {
        type: "button",
        name: "strike",
        icon: "ri:strikethrough",
        title: "删除线",
        action: () => editor.value?.chain().focus().toggleStrike().run(),
        isActive: () => !!editor.value?.isActive("strike")
      },
      {
        type: "button",
        name: "code",
        icon: "ri:code-view",
        title: "行内代码",
        action: () => editor.value?.chain().focus().toggleCode().run(),
        isActive: () => !!editor.value?.isActive("code")
      },
      {
        type: "divider"
      },
      {
        type: "button",
        name: "bulletList",
        icon: "ri:list-unordered",
        title: "无序列表",
        action: () => editor.value?.chain().focus().toggleBulletList().run(),
        isActive: () => !!editor.value?.isActive("bulletList")
      },
      {
        type: "button",
        name: "orderedList",
        icon: "ri:list-ordered",
        title: "有序列表",
        action: () => editor.value?.chain().focus().toggleOrderedList().run(),
        isActive: () => !!editor.value?.isActive("orderedList")
      },
      {
        type: "button",
        name: "taskList",
        icon: "ri:task-line",
        title: "任务列表",
        action: () => editor.value?.chain().focus().toggleTaskList().run(),
        isActive: () => !!editor.value?.isActive("taskList")
      },
      {
        type: "divider"
      },
      {
        type: "button",
        name: "blockquote",
        icon: "ri:double-quotes-l",
        title: "引用",
        action: () => editor.value?.chain().focus().toggleBlockquote().run(),
        isActive: () => !!editor.value?.isActive("blockquote")
      },
      {
        type: "button",
        name: "codeBlock",
        icon: "ri:code-box-line",
        title: "代码块",
        action: () => editor.value?.chain().focus().toggleCodeBlock().run(),
        isActive: () => !!editor.value?.isActive("codeBlock")
      },
      {
        type: "button",
        name: "horizontalRule",
        icon: "ri:separator",
        title: "水平线",
        action: () => editor.value?.chain().focus().setHorizontalRule().run(),
        isActive: () => false
      },
      {
        type: "divider"
      }
    ];
  });

  return {
    toolbarItems
  };
};
