# 项目规范

## 项目技术栈

- 框架：Nuxt 4 + Nuxt UI 4
- 语言：TypeScript (严格模式)
- 样式：Tailwind CSS V4
- 状态管理：Pinia
- 数据库：Prisma + PostgreSQL
- 组件库：Nuxt UI
- 图标库：Iconify

## 编码规范

- 文件名使用 kebab-case
- 组件文件名使用PascalCase
- 工具函数使用camelCase
- 组件样式使用BEM规范
- TS中禁止使用any类型，必要时才使用unknown类型
- 生成的代码需要添加详细注释
- 代码文件使用 utf-8 编码

## 我的编码偏好

- 缩进：2个空格
- 引号：双引号优于单引号
- 分号：always
- 对象和数组：不要尾随逗号
- 注释：使用JSDoc注释
- git commit：使用中文并遵循`Conventional Commits`规范

## 我的习惯

- 优先使用const，其次let，避免var
- 函数优先使用箭头函数
- 解构赋值能用就用
- 条件渲染优先使用三元运算符

## 禁止事项

- 禁止启动开发服务器
- 禁止打开预览进行验证
- 禁止运行语法检查
- 禁止自动引入未使用的依赖
- 禁止在沙箱中运行项目和测试
- 禁止硬编码密钥、Token、账号密码
- 禁止自动安装依赖包，有需要时提示我手动安装
- 禁止删除已有注释，除非是注释错误或调整了代码逻辑
- 禁止使用路由名称跳转，必须使用url路径跳转，如有参数须拼接在路径中
- 禁止在多轮对话中，恢复被手动修改过的代码，除非代码有误
- 禁止在修改代码时修改文件编码

## 生成代码时必须遵循的规范

- Vue 3 代码规范（Composition API + `<script setup>`）
- 代码必须简洁、类型安全、可维护
- 注释只写关键逻辑，不写废话
- 工具函数放在`utils`目录下，文件名使用 camelCase，生成代码时优先使用已有的工具函数，避免重复实现
- 如果生成的代码中需要使用新的工具函数，必须在`utils`目录下创建对应的文件或函数
- 函数优先使用箭头函数，避免使用 this 指向问题
- 业务组件放在对应页面的`components`目录下，文件名使用 PascalCase
- watch 监听变化时，新值使用`newVal`，旧值使用`oldVal`
- 如果需要导入类型使用`import type {xxx} from xxx`，避免直接使用`import`以及混合导入`import {xxx, type xxxType} from xxx`
- 组件props使用`运行时声明`的方式

  ```typescript
  const props = defineProps({
    data: {
      type: Object as PropType<XXX>
    }
  });
  ```

- 组件emits使用`基于类型声明`的方式

  ```typescript
  const emit = defineEmits<{
    change: [id: number];
    update: [value: string];
  }>();
  ```

- 表单数据使用`useForm`函数

  ```typescript
  const { formData } = useForm<FormData>({
    value1: "",
    value2: ""
  });
  ```

- 如果出现单独写css样式的情况下，class名称遵守BEM规范，绝大部分情况下使用tailwindcss的类名
- 弹窗表单使用`mode` + `record`模式, 其中`mode`为`create`或`edit`及其它自定义模式, `record`为当前操作的记录数据
- 在处理数据时严格遵守接口字段名称，非必要不做二次翻译

## Git 提交规范

遵循 Conventional Commits 规范，允许在类型前添加 emoji，标题和详情使用中文描述。

### 提交格式

```
<emoji> <type>[(scope)]: <中文标题>

<中文详情，可使用有序或无序列表>
```

### 类型与 emoji

| emoji | 类型     | 说明                                |
| ----- | -------- | ----------------------------------- |
| ✨    | feat     | 新功能                              |
| 🐛    | fix      | 修复缺陷                            |
| 📝    | docs     | 文档变更                            |
| 🎨    | style    | 代码格式调整（不影响功能）          |
| ♻️    | refactor | 重构（既非新增功能也非修复缺陷）    |
| ⚡    | perf     | 性能优化                            |
| ✅    | test     | 测试相关                            |
| 📦    | build    | 构建系统或外部依赖变更              |
| 👷    | ci       | CI 配置变更                         |
| 🔧    | chore    | 杂项（不修改 src 或测试的其它变更） |
| ⏪️    | revert   | 回滚提交                            |

### 要求

- emoji 可选，添加时放在 type 前，与 type 之间用空格分隔
- 标题使用中文，简明扼要，不加句号
- scope 可选，用于标识影响范围（如模块名），如 `feat(archival): ...`
- 详情使用中文，说明"为什么"而非"做了什么"
- 详情可使用有序或无序列表，每项简明扼要
- 一个提交只做一件事，避免混合多个不相关改动

### 示例

```
✨ feat: 新增系统主题设置页面

- 新增页头/弹窗/站点配置三个区块，支持图片压缩上传
- 使用 useForm 管理表单，首屏展示 store 缓存，onMounted 拉取服务端最新配置
- 保存成功后以当前数据为基准，使 isDirty 归零
```

```
🐛 fix: 修复库房树加载失败时未清空旧数据的问题

- 请求失败时重置 treeData 为空数组，避免展示过期数据
- 使用 useLogger 记录错误日志，不把 error 透传到 $message
```
