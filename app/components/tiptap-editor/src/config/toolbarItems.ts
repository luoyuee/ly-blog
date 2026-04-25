import type { EditorToolbarItem } from "@nuxt/ui";

export const fixedToolbarItems = [
  [
    {
      kind: "undo",
      icon: "lucide:undo-2",
      tooltip: { text: "撤销" }
    },
    {
      kind: "redo",
      icon: "lucide:redo-2",
      tooltip: { text: "重做" }
    }
  ],
  [
    {
      kind: "paragraph",
      icon: "lucide:pilcrow",
      tooltip: { text: "正文" }
    },
    {
      kind: "heading",
      level: 1,
      icon: "lucide:heading-1",
      tooltip: { text: "一级标题" }
    },
    {
      kind: "heading",
      level: 2,
      icon: "lucide:heading-2",
      tooltip: { text: "二级标题" }
    },
    {
      kind: "heading",
      level: 3,
      icon: "lucide:heading-3",
      tooltip: { text: "三级标题" }
    }
  ],
  [
    {
      kind: "bulletList",
      icon: "lucide:list",
      tooltip: { text: "无序列表" }
    },
    {
      kind: "orderedList",
      icon: "lucide:list-ordered",
      tooltip: { text: "有序列表" }
    },
    {
      kind: "taskList",
      icon: "lucide:list-todo",
      tooltip: { text: "任务列表" }
    },
    {
      kind: "blockquote",
      icon: "lucide:text-quote",
      tooltip: { text: "引用" }
    },
    {
      kind: "codeBlock",
      icon: "lucide:square-code",
      tooltip: { text: "代码块" }
    },
    {
      kind: "horizontalRule",
      icon: "lucide:separator-horizontal",
      tooltip: { text: "分割线" }
    },
    {
      slot: "link" as const,
      icon: "lucide:link",
      tooltip: { text: "链接" }
    },
    {
      slot: "textColor" as const,
      icon: "lucide:palette",
      tooltip: { text: "文字颜色" }
    }
  ]
] satisfies EditorToolbarItem[][];

export const bubbleToolbarItems = [
  [
    {
      kind: "mark",
      mark: "bold",
      icon: "lucide:bold",
      tooltip: { text: "加粗" }
    },
    {
      kind: "mark",
      mark: "italic",
      icon: "lucide:italic",
      tooltip: { text: "斜体" }
    },
    {
      kind: "mark",
      mark: "underline",
      icon: "lucide:underline",
      tooltip: { text: "下划线" }
    },
    {
      kind: "mark",
      mark: "strike",
      icon: "lucide:strikethrough",
      tooltip: { text: "删除线" }
    },
    {
      kind: "mark",
      mark: "code",
      icon: "lucide:code",
      tooltip: { text: "行内代码" }
    },
    {
      slot: "highlight" as const,
      icon: "lucide:highlighter",
      tooltip: { text: "高亮" }
    },
    {
      slot: "link" as const,
      icon: "lucide:link",
      tooltip: { text: "链接" }
    },
    {
      kind: "clearFormatting",
      icon: "lucide:remove-formatting",
      tooltip: { text: "清除格式" }
    }
  ]
] satisfies EditorToolbarItem[][];
