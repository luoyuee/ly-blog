import type { EditorTabItem } from "#shared/types/mdc-editor";
import mitt from "mitt";

type Events = {
  "note:new": undefined;
  "note:remove": string;

  "editor-tab-bar:change": EditorTabItem;

  "editor-core:save": EditorTabItem;
};

const emitter = mitt<Events>();

export default emitter;
