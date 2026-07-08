import type * as MonacoEditor from "monaco-editor";
import { language as mdc } from "@nuxtlabs/monarch-mdc";

/**
 * 注册编辑器语言与补全。
 */
export const registerEditorLanguage = (monaco: typeof MonacoEditor) => {
  monaco.languages.register({ id: "mdc" });
  monaco.languages.setMonarchTokensProvider("mdc", mdc);
  monaco.languages.setMonarchTokensProvider("markdown", mdc);
  monaco.languages.setLanguageConfiguration("markdown", {
    autoClosingPairs: [
      { open: "(", close: ")" },
      { open: "[", close: "]" },
      { open: "{", close: "}" },
      { open: "`", close: "`" },
      { open: "**", close: "**" },
      { open: "_", close: "_" }
    ],
    surroundingPairs: [
      { open: "(", close: ")" },
      { open: "[", close: "]" },
      { open: "{", close: "}" },
      { open: "`", close: "`" },
      { open: "**", close: "**" },
      { open: "_", close: "_" }
    ]
  });

  monaco.languages.registerOnTypeFormattingEditProvider("markdown", {
    autoFormatTriggerCharacters: ["\n"],
    provideOnTypeFormattingEdits: (model, position, ch) => {
      if (ch !== "\n" || position.lineNumber <= 1) return [];

      const previousLine = model.getLineContent(position.lineNumber - 1);
      const currentLine = model.getLineContent(position.lineNumber);
      const currentIndent = currentLine.match(/^\s*/)?.[0] ?? "";
      const taskListMatch = previousLine.match(/^(\s*)[-*+] \[[ xX]\]\s+\S.*$/);
      const unorderedListMatch = previousLine.match(/^(\s*)([-*+])\s+\S.*$/);
      const orderedListMatch = previousLine.match(/^(\s*)(\d+)([.)])\s+\S.*$/);
      const checkboxText = taskListMatch ? `${taskListMatch[1]}- [ ] ` : "";
      const unorderedText =
        !checkboxText && unorderedListMatch
          ? `${unorderedListMatch[1]}${unorderedListMatch[2]} `
          : "";
      const orderedText = orderedListMatch
        ? `${orderedListMatch[1]}${Number(orderedListMatch[2]) + 1}${orderedListMatch[3]} `
        : "";
      const insertText = checkboxText || unorderedText || orderedText;

      if (!insertText) return [];

      return [
        {
          range: new monaco.Range(
            position.lineNumber,
            1,
            position.lineNumber,
            currentIndent.length + 1
          ),
          text: insertText
        }
      ];
    }
  });

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
