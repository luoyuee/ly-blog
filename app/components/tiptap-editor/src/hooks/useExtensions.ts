import StarterKit from "@tiptap/starter-kit";

import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import CodeBlockComponent from "../components/CodeBlockComponent.vue";

import { VueNodeViewRenderer } from "@tiptap/vue-3";

// eslint-disable-next-line
export const useExtensions = (options: { placeholder: string; lowlight: any }) => {
  const extensions = [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6]
      },
      codeBlock: false // 禁用默认代码块，使用高亮版本
    }),
    Placeholder.configure({
      placeholder: options.placeholder
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "text-blue-500 hover:text-blue-600"
      }
    }),
    Image.configure({
      allowBase64: true,
      inline: true
    }),
    TaskList,
    TaskItem.configure({
      nested: true
    }),
    CodeBlockLowlight.extend({
      addNodeView() {
        return VueNodeViewRenderer(CodeBlockComponent);
      }
    }).configure({
      lowlight: options.lowlight,
      languageClassPrefix: "language-",
      defaultLanguage: "auto",
      HTMLAttributes: {
        class: "code-block"
      }
    })
  ];

  return extensions;
};
