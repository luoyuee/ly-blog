import type { EditorToolbarItem } from "@nuxt/ui";

/** vue-i18n 翻译函数类型 */
type Translate = (key: string) => string;

/**
 * 固定工具栏项。因 tooltip 需要响应语言切换，改为工厂函数按当前语言生成。
 */
export const createFixedToolbarItems = (t: Translate): EditorToolbarItem[][] => {
  return [
    [
      {
        kind: "undo",
        icon: "lucide:undo-2",
        tooltip: { text: t("components.tiptapEditor.toolbar.undo") }
      },
      {
        kind: "redo",
        icon: "lucide:redo-2",
        tooltip: { text: t("components.tiptapEditor.toolbar.redo") }
      }
    ],
    [
      {
        kind: "paragraph",
        icon: "lucide:pilcrow",
        tooltip: { text: t("components.tiptapEditor.toolbar.paragraph") }
      },
      {
        kind: "heading",
        level: 1,
        icon: "lucide:heading-1",
        tooltip: { text: t("components.tiptapEditor.toolbar.heading1") }
      },
      {
        kind: "heading",
        level: 2,
        icon: "lucide:heading-2",
        tooltip: { text: t("components.tiptapEditor.toolbar.heading2") }
      },
      {
        kind: "heading",
        level: 3,
        icon: "lucide:heading-3",
        tooltip: { text: t("components.tiptapEditor.toolbar.heading3") }
      }
    ],
    [
      {
        kind: "bulletList",
        icon: "lucide:list",
        tooltip: { text: t("components.tiptapEditor.toolbar.bulletList") }
      },
      {
        kind: "orderedList",
        icon: "lucide:list-ordered",
        tooltip: { text: t("components.tiptapEditor.toolbar.orderedList") }
      },
      {
        kind: "taskList",
        icon: "lucide:list-todo",
        tooltip: { text: t("components.tiptapEditor.toolbar.taskList") }
      },
      {
        kind: "blockquote",
        icon: "lucide:text-quote",
        tooltip: { text: t("components.tiptapEditor.toolbar.blockquote") }
      },
      {
        kind: "codeBlock",
        icon: "lucide:square-code",
        tooltip: { text: t("components.tiptapEditor.toolbar.codeBlock") }
      },
      {
        kind: "horizontalRule",
        icon: "lucide:separator-horizontal",
        tooltip: { text: t("components.tiptapEditor.toolbar.horizontalRule") }
      },
      {
        slot: "link" as const,
        icon: "lucide:link",
        tooltip: { text: t("components.tiptapEditor.toolbar.link") }
      },
      {
        slot: "textColor" as const,
        icon: "lucide:palette",
        tooltip: { text: t("components.tiptapEditor.toolbar.textColor") }
      }
    ]
  ] satisfies EditorToolbarItem[][];
};

/**
 * 气泡工具栏项。同样改为工厂函数以支持语言切换。
 */
export const createBubbleToolbarItems = (t: Translate): EditorToolbarItem[][] => {
  return [
    [
      {
        kind: "mark",
        mark: "bold",
        icon: "lucide:bold",
        tooltip: { text: t("components.tiptapEditor.toolbar.bold") }
      },
      {
        kind: "mark",
        mark: "italic",
        icon: "lucide:italic",
        tooltip: { text: t("components.tiptapEditor.toolbar.italic") }
      },
      {
        kind: "mark",
        mark: "underline",
        icon: "lucide:underline",
        tooltip: { text: t("components.tiptapEditor.toolbar.underline") }
      },
      {
        kind: "mark",
        mark: "strike",
        icon: "lucide:strikethrough",
        tooltip: { text: t("components.tiptapEditor.toolbar.strike") }
      },
      {
        kind: "mark",
        mark: "code",
        icon: "lucide:code",
        tooltip: { text: t("components.tiptapEditor.toolbar.code") }
      },
      {
        slot: "highlight" as const,
        icon: "lucide:highlighter",
        tooltip: { text: t("components.tiptapEditor.toolbar.highlight") }
      },
      {
        slot: "link" as const,
        icon: "lucide:link",
        tooltip: { text: t("components.tiptapEditor.toolbar.link") }
      },
      {
        kind: "clearFormatting",
        icon: "lucide:remove-formatting",
        tooltip: { text: t("components.tiptapEditor.toolbar.clearFormat") }
      }
    ]
  ] satisfies EditorToolbarItem[][];
};
