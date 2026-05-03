import type * as MonacoEditor from "monaco-editor";
import { language as mdc } from "@nuxtlabs/monarch-mdc";

/**
 * 注册编辑器语言与补全。
 */
export const registerEditorLanguage = (monaco: typeof MonacoEditor) => {
  monaco.languages.register({ id: "mdc" });
  monaco.languages.setMonarchTokensProvider("mdc", mdc);

  monaco.languages.registerCompletionItemProvider("markdown", {
    provideCompletionItems: (model, position) => {
      const wordPosition = model.getWordAtPosition(position);
      if (!wordPosition) return;

      const start = {
        lineNumber: position.lineNumber,
        column: wordPosition.startColumn
      };

      return {
        suggestions: [
          {
            label: "card",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "::card::\n\n::card::",
            detail: "Card 组件",
            documentation: "在文档中使用Card组件",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: monaco.Range.fromPositions(start)
          }
        ]
      };
    }
  });
};
