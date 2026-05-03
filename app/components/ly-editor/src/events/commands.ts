/**
 * 工作台命令事件常量。
 */
export const LyEditorCommand = {
  NewFile: "cmd.editor-core:new:file",
  OpenFile: "cmd.editor-core:open:file",
  CloseFile: "cmd.editor-core:close:file",
  SwitchFile: "cmd.editor-core:switch:file",
  UpdateFile: "cmd.editor-core:update:file",
  InsertCard: "cmd.editor-core:insert:card",
  InsertCardLegacy: "cmd.editor-core:inster:card",
  ReloadNoteManager: "cmd.note-manager:reload",
  PublishArticle: "cmd.note-manager:publish:article",
  ReloadArticleManager: "cmd.article-manager:reload"
} as const;
