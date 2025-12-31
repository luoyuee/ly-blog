import type { EditorTabItem } from "#shared/types/ly-editor";
import type { NoteFolderForm } from "#shared/types/note";
import mitt from "mitt";

/**
 * Ly Editor 事件命名规范 - 命名空间分层法
 *
 * 格式: {namespace}.{component}:{action}[:{target}]
 *
 * 规范说明:
 * 1. namespace: 事件类型命名空间，用于快速识别事件性质
 *    - state: 状态事件，描述已发生的状态变化
 *    - intent: 意图事件，表达组件想要执行的操作
 *    - cmd: 命令事件，直接执行的操作指令
 *    - notify: 通知事件，用于显示消息、提示等UI反馈
 *    - system: 系统事件，用于系统级操作和状态管理
 *    - request: 请求事件，用于数据获取和API调用
 *    - error: 错误事件，用于错误处理和异常报告
 * 2. component: 组件名称，使用小写字母和连字符，如 note-manager, editor-core
 * 3. action: 动作名称，使用小写字母，如 create, update, delete, change, save
 * 4. target: 可选的目标对象，使用小写字母，如 file, tab, content
 * 5. 分隔符: 命名空间使用点号 (.)，其他使用冒号 (:)
 * 6. 多个单词使用连字符 (-) 连接
 *
 * 示例:
 * - state.note-manager:created:note - 笔记已创建（状态事件）
 * - intent.editor-core:save:file - 编辑器想要保存文件（意图事件）
 * - cmd.file-explorer:refresh - 执行文件浏览器刷新（命令事件）
 * - state.tab-bar:activated:tab - 标签页已激活（状态事件）
 * - intent.monaco-editor:switch:file - Monaco编辑器想要切换文件（意图事件）
 * - notify.system:show:success - 显示成功通知（通知事件）
 * - system.theme:changed:mode - 主题模式已切换（系统事件）
 * - request.api:fetch:notes - 请求获取笔记数据（请求事件）
 * - error.editor:failed:save - 编辑器保存失败（错误事件）
 *
 * 组件分类:
 * - note-manager: 笔记管理相关
 * - editor-core: 编辑器核心功能
 * - tab-bar: 标签栏相关
 * - monaco-editor: Monaco编辑器相关
 * - file-explorer: 文件浏览器相关
 * - article-manager: 文章管理相关
 *
 * 事件类型说明:
 * - state.*: 状态事件，用于通知状态变化，通常使用过去时动词
 * - intent.*: 意图事件，用于表达操作意图，由发起组件触发，等待其他组件响应
 * - cmd.*: 命令事件，用于直接执行操作，立即执行的指令
 * - notify.*: 通知事件，用于触发用户界面反馈，如消息提示、加载状态等
 * - system.*: 系统事件，用于应用级别的操作，如主题切换、配置更新等
 * - request.*: 请求事件，用于触发数据请求和API调用，通常需要异步处理
 * - error.*: 错误事件，用于错误处理流程，包括错误报告和恢复机制
 */
type Events = {
  // 笔记管理器事件
  "note-manager:create": undefined;
  "note-manager:delete": string;
  "intent.note-manager:new:folder": undefined;
  "intent.note-manager:rename:folder": NoteFolderForm;
  "cmd.note-manager:reload": undefined;
  "cmd.note-manager:publish:article": FolderTreeItem;

  // 标签栏事件
  "tab-bar:change": EditorTabItem;

  // 编辑器核心事件
  "intent.editor-core:save:file": EditorTabItem;
  "cmd.editor-core:insert:card": undefined;
  "cmd.editor-core:new:file": undefined;
  "cmd.editor-core:open:file": EditorTabItem;
  "cmd.editor-core:close:file": EditorTabItem;
  "cmd.editor-core:switch:file": EditorTabItem;
  "cmd.editor-core:update:file": EditorTabItem;
  "cmd.editor-core:inster:card": undefined;

  // 预览组件
  "editor-preview:preview:content": string;

  // Monaco编辑器事件
  "monaco-editor:open:file": { path: string; content: string };
  "monaco-editor:close:file": { path: string };
  "monaco-editor:update:file": { path: string; content: string };
  "monaco-editor:switch:file": string;
  "monaco-editor:preview:content": string;

  // 文件浏览器事件
  "file-explorer:reload": undefined;

  // 文章管理器事件
  "cmd.article-manager:reload": undefined;

  // 弹窗管理器
  "cmd.modal-manager:open:category-form": ArticleCategoryForm | undefined;
  "cmd.modal-manager:open:category-details": ArticleCategory;
};

const emitter = mitt<Events>();

export default emitter;
