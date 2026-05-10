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

## 我的编码偏好

- 缩进：2个空格
- 引号：双引号优于单引号
- 分号：always
- 对象和数组：不要尾随逗号
- 注释：使用JSDoc注释

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
