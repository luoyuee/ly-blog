import type { Extensions } from "@tiptap/vue-3";
import { VueNodeViewRenderer } from "@tiptap/vue-3";
import { createLowlight } from "./createLowlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import EditorCodeBlock from "../components/EditorCodeBlock.vue";

const lowlight = createLowlight();

export const createExtensions = (): Extensions => {
  return [
    TextStyle,
    Color.configure({
      types: [TextStyle.name]
    }),
    Highlight.configure({
      multicolor: true
    }),
    TaskList,
    TaskItem.configure({
      nested: true
    }),
    CharacterCount,
    CodeBlockLowlight.extend({
      addNodeView() {
        return VueNodeViewRenderer(EditorCodeBlock);
      }
    }).configure({
      lowlight,
      defaultLanguage: "auto",
      languageClassPrefix: "language-",
      HTMLAttributes: {
        class: "code-block"
      }
    })
  ];
};
