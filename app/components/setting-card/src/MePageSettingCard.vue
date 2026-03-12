<script setup lang="ts">
import type { FormSubmitEvent, TableColumn } from "@nuxt/ui";
import type {
  IClientConfigMePage,
  IClientConfigMePageBaseInfoItem,
  IClientConfigMePageFaqItem,
  IClientConfigMePageLinkItem,
  IClientConfigMePageProfileTagItem,
  IClientConfigMePageSkillGridItem,
  IClientConfigMePageSocialLinkItem
} from "#shared/types/config";
import type { WatchStopHandle } from "vue";
import { BasicModal } from "@/components/basic-modal";
import { InputTagArea } from "@/components/form/input";
import { SelectIcon } from "@/components/form/select";
import { useConfigStore } from "@/stores";
import { cloneDeep, isEqual } from "lodash-es";
import { h, resolveComponent, watch } from "vue";
import { z } from "zod";
import SettingCard from "./SettingCard.vue";

const configStore = useConfigStore();

const UButton = resolveComponent("UButton");
const UIcon = resolveComponent("UIcon");
const UBadge = resolveComponent("UBadge");

/**
 * 个人页（/me）使用的配置项：
 * - configStore.me_page：个人页大部分内容
 * - 头像来源：me_page.author.avatar（/me 页面使用该字段）
 */
const formData = reactive<IClientConfigMePage>({
  author: {
    name: "",
    avatar: "",
    location: "",
    dev_role: "",
    dev_direction: "",
    quote: "",
    tags: []
  },
  github_snake: {
    light: "",
    dark: ""
  },
  intro: {
    base_info: [],
    skills: [],
    interest_tags: [],
    language_proficiency: []
  },
  skills_grid: [],
  website_list: [],
  project_list: [],
  social_links: [],
  faq_items: []
});

const state = reactive({
  isChange: false,
  submitting: false
});

/**
 * 顶层表单校验：只做最基础的必填/URL 检查。
 * 复杂列表项（如 base_info、links、faq 等）在对应弹窗内做校验。
 */
const schema = z.object({
  author: z.object({
    name: z.string({ message: "请输入名称" }).min(1, "请输入名称"),
    avatar: z.union([z.string().url("请输入正确的头像链接"), z.literal("")]).optional(),
    location: z.string().optional(),
    dev_role: z.string().optional(),
    dev_direction: z.string().optional(),
    quote: z.string().optional()
  }),
  github_snake: z.object({
    light: z.union([z.string().url("请输入正确的图片链接"), z.literal("")]).optional(),
    dark: z.union([z.string().url("请输入正确的图片链接"), z.literal("")]).optional()
  })
});

let formWatcher: WatchStopHandle;
/**
 * 监听表单状态变化，用于显示“取消/保存”按钮。
 * watch(reactiveObject) 在 Vue 3 中默认是 deep 监听，能覆盖嵌套对象/数组修改。
 */
const startWatch = () => {
  formWatcher = watch(formData, (newVal) => {
    state.isChange = !isEqual(newVal, configStore.me_page);
  });
};
const stopWatch = () => {
  if (formWatcher) formWatcher();
};

onMounted(() => {
  Object.assign(formData, cloneDeep(configStore.me_page));
  startWatch();
});

const formRef = useTemplateRef("formRef");
const handleSave = () => {
  formRef.value?.submit();
};

const handleSubmit = async () => {
  state.submitting = true;
  try {
    await configStore.update({
      me_page: unref(formData)
    });
    handleReset();
  } finally {
    state.submitting = false;
  }
};

const handleReset = () => {
  stopWatch();
  Object.assign(formData, cloneDeep(configStore.me_page));
  state.isChange = false;
  startWatch();
};

const badgeColorOptions = ["primary", "neutral", "success", "warning", "error", "info"];

/**
 * =========================
 * Profile Tags（author.tags）
 * =========================
 */
const profileTagModalState = reactive<{
  visible: boolean;
  editingIndex: number | null;
}>({
  visible: false,
  editingIndex: null
});

const profileTagModalForm = reactive<IClientConfigMePageProfileTagItem>({
  label: "",
  color: "primary"
});

const profileTagModalSchema = z.object({
  label: z
    .string({ message: "请输入标签文本" })
    .min(1, "请输入标签文本")
    .superRefine((value, ctx) => {
      if (profileTagModalState.editingIndex !== null) return;
      if (formData.author.tags.some((item) => item.label === value)) {
        ctx.addIssue({ code: "custom", message: "标签重复" });
      }
    }),
  color: z.enum(badgeColorOptions).optional()
});

const profileTagModalFormRef = useTemplateRef("profileTagModalFormRef");

const openAddProfileTagModal = () => {
  profileTagModalForm.label = "";
  profileTagModalForm.color = "primary";
  profileTagModalState.editingIndex = null;
  profileTagModalState.visible = true;
};

const openEditProfileTagModal = (index: number) => {
  const item = formData.author.tags[index];
  if (!item) return;
  profileTagModalForm.label = item.label;
  profileTagModalForm.color = item.color;
  profileTagModalState.editingIndex = index;
  profileTagModalState.visible = true;
};

const submitProfileTagModal = (event: FormSubmitEvent<z.output<typeof profileTagModalSchema>>) => {
  const { label, color } = event.data;
  if (profileTagModalState.editingIndex === null) {
    formData.author.tags.push({
      label,
      color: (color as IClientConfigMePageProfileTagItem["color"]) || "primary"
    });
  } else {
    const idx = profileTagModalState.editingIndex;
    if (formData.author.tags[idx]) {
      formData.author.tags[idx] = {
        label,
        color: (color as IClientConfigMePageProfileTagItem["color"]) || "primary"
      };
    }
  }
  profileTagModalState.visible = false;
};

const confirmProfileTagModal = () => {
  profileTagModalFormRef.value?.submit();
};

const profileTagColumns: TableColumn<IClientConfigMePageProfileTagItem>[] = [
  { accessorKey: "label", header: "标签" },
  {
    accessorKey: "color",
    header: "颜色",
    cell: ({ row }) => {
      const { color } = row.original;
      return h(
        UBadge,
        {
          color,
          variant: "soft",
          size: "sm"
        },
        () => color
      );
    }
  },
  {
    id: "actions",
    header: "操作",
    meta: {
      class: {
        th: "text-right",
        td: "text-right"
      }
    },
    cell: ({ row }) => {
      const idx = row.index;
      return h("div", { class: "flex justify-end gap-2" }, [
        h(UButton, {
          size: "xs",
          color: "primary",
          variant: "ghost",
          icon: "ep:edit",
          onClick: () => openEditProfileTagModal(idx)
        }),
        h(UButton, {
          size: "xs",
          color: "error",
          variant: "ghost",
          icon: "ep:delete",
          onClick: () => {
            formData.author.tags = formData.author.tags.filter((_, i) => i !== idx);
          }
        })
      ]);
    }
  }
];

/**
 * =========================
 * Base Info（intro.base_info）
 * =========================
 */
const baseInfoModalState = reactive<{
  visible: boolean;
  editingIndex: number | null;
}>({
  visible: false,
  editingIndex: null
});

const baseInfoModalForm = reactive<IClientConfigMePageBaseInfoItem>({
  label: "",
  value: "",
  icon: "ep:user",
  href: undefined
});

const baseInfoModalSchema = z.object({
  label: z.string({ message: "请输入标签" }).min(1, "请输入标签"),
  value: z.string({ message: "请输入内容" }).min(1, "请输入内容"),
  icon: z.string({ message: "请选择图标" }).min(1, "请选择图标"),
  href: z.union([z.string().url("请输入正确的链接"), z.literal("")]).optional()
});

const baseInfoModalFormRef = useTemplateRef("baseInfoModalFormRef");

const openAddBaseInfoModal = () => {
  baseInfoModalForm.label = "";
  baseInfoModalForm.value = "";
  baseInfoModalForm.icon = "ep:user";
  baseInfoModalForm.href = undefined;
  baseInfoModalState.editingIndex = null;
  baseInfoModalState.visible = true;
};

const openEditBaseInfoModal = (index: number) => {
  const item = formData.intro.base_info[index];
  if (!item) return;
  baseInfoModalForm.label = item.label;
  baseInfoModalForm.value = item.value;
  baseInfoModalForm.icon = item.icon;
  baseInfoModalForm.href = item.href;
  baseInfoModalState.editingIndex = index;
  baseInfoModalState.visible = true;
};

const submitBaseInfoModal = (event: FormSubmitEvent<z.output<typeof baseInfoModalSchema>>) => {
  const { label, value, icon, href } = event.data;
  const nextItem: IClientConfigMePageBaseInfoItem = {
    label,
    value,
    icon,
    href: href ? href : undefined
  };
  if (baseInfoModalState.editingIndex === null) {
    formData.intro.base_info.push(nextItem);
  } else {
    const idx = baseInfoModalState.editingIndex;
    if (formData.intro.base_info[idx]) formData.intro.base_info[idx] = nextItem;
  }
  baseInfoModalState.visible = false;
};

const confirmBaseInfoModal = () => {
  baseInfoModalFormRef.value?.submit();
};

const baseInfoColumns: TableColumn<IClientConfigMePageBaseInfoItem>[] = [
  {
    accessorKey: "icon",
    header: "图标",
    cell: ({ row }) => h(UIcon, { name: row.original.icon })
  },
  { accessorKey: "label", header: "标题" },
  { accessorKey: "value", header: "内容" },
  {
    accessorKey: "href",
    header: "链接",
    cell: ({ row }) => {
      const href = row.original.href;
      if (!href) return "";
      return h(
        "a",
        {
          href,
          target: "_blank",
          rel: "noopener noreferrer",
          class: "text-primary block w-40 overflow-hidden whitespace-nowrap text-ellipsis"
        },
        href
      );
    }
  },
  {
    id: "actions",
    header: "操作",
    meta: {
      class: {
        th: "text-right",
        td: "text-right"
      }
    },
    cell: ({ row }) => {
      const idx = row.index;
      return h("div", { class: "flex justify-end gap-2" }, [
        h(UButton, {
          size: "xs",
          color: "primary",
          variant: "ghost",
          icon: "ep:edit",
          onClick: () => openEditBaseInfoModal(idx)
        }),
        h(UButton, {
          size: "xs",
          color: "error",
          variant: "ghost",
          icon: "ep:delete",
          onClick: () => {
            formData.intro.base_info = formData.intro.base_info.filter((_, i) => i !== idx);
          }
        })
      ]);
    }
  }
];

/**
 * =========================
 * Skill Grid（skills_grid）
 * =========================
 */
const skillGridModalState = reactive<{
  visible: boolean;
  editingIndex: number | null;
}>({
  visible: false,
  editingIndex: null
});

const skillGridModalForm = reactive<IClientConfigMePageSkillGridItem>({
  title: "",
  icon: "ep:cpu",
  href: undefined
});

const skillGridModalSchema = z.object({
  title: z.string({ message: "请输入标题" }).min(1, "请输入标题"),
  icon: z.string({ message: "请选择图标" }).min(1, "请选择图标"),
  href: z.union([z.string().url("请输入正确的链接"), z.literal("")]).optional()
});

const skillGridModalFormRef = useTemplateRef("skillGridModalFormRef");

const openAddSkillGridModal = () => {
  skillGridModalForm.title = "";
  skillGridModalForm.icon = "ep:cpu";
  skillGridModalForm.href = undefined;
  skillGridModalState.editingIndex = null;
  skillGridModalState.visible = true;
};

const openEditSkillGridModal = (index: number) => {
  const item = formData.skills_grid[index];
  if (!item) return;
  skillGridModalForm.title = item.title;
  skillGridModalForm.icon = item.icon;
  skillGridModalForm.href = item.href;
  skillGridModalState.editingIndex = index;
  skillGridModalState.visible = true;
};

const submitSkillGridModal = (event: FormSubmitEvent<z.output<typeof skillGridModalSchema>>) => {
  const { title, icon, href } = event.data;
  const nextItem: IClientConfigMePageSkillGridItem = {
    title,
    icon,
    href: href ? href : undefined
  };
  if (skillGridModalState.editingIndex === null) {
    formData.skills_grid.push(nextItem);
  } else {
    const idx = skillGridModalState.editingIndex;
    if (formData.skills_grid[idx]) formData.skills_grid[idx] = nextItem;
  }
  skillGridModalState.visible = false;
};

const confirmSkillGridModal = () => {
  skillGridModalFormRef.value?.submit();
};

const skillGridColumns: TableColumn<IClientConfigMePageSkillGridItem>[] = [
  {
    accessorKey: "icon",
    header: "图标",
    cell: ({ row }) => h(UIcon, { name: row.original.icon })
  },
  { accessorKey: "title", header: "标题" },
  {
    accessorKey: "href",
    header: "链接",
    cell: ({ row }) => {
      const href = row.original.href;
      if (!href) return "";
      return h(
        "a",
        {
          href,
          target: "_blank",
          rel: "noopener noreferrer",
          class: "text-primary block w-40 overflow-hidden whitespace-nowrap text-ellipsis"
        },
        href
      );
    }
  },
  {
    id: "actions",
    header: "操作",
    meta: {
      class: {
        th: "text-right",
        td: "text-right"
      }
    },
    cell: ({ row }) => {
      const idx = row.index;
      return h("div", { class: "flex justify-end gap-2" }, [
        h(UButton, {
          size: "xs",
          color: "primary",
          variant: "ghost",
          icon: "ep:edit",
          onClick: () => openEditSkillGridModal(idx)
        }),
        h(UButton, {
          size: "xs",
          color: "error",
          variant: "ghost",
          icon: "ep:delete",
          onClick: () => {
            formData.skills_grid = formData.skills_grid.filter((_, i) => i !== idx);
          }
        })
      ]);
    }
  }
];

/**
 * =========================
 * Link List（website_list / project_list）
 * =========================
 */
const linkListModalState = reactive<{
  visible: boolean;
  editingIndex: number | null;
  type: "website" | "project";
}>({
  visible: false,
  editingIndex: null,
  type: "website"
});

const linkListModalForm = reactive<IClientConfigMePageLinkItem>({
  title: "",
  desc: "",
  href: "",
  icon: ""
});

const linkListModalSchema = z.object({
  title: z.string({ message: "请输入标题" }).min(1, "请输入标题"),
  desc: z.string({ message: "请输入描述" }).min(1, "请输入描述"),
  href: z.string({ message: "请输入链接" }).url("请输入正确的链接"),
  icon: z
    .string({ message: "请输入图标图片链接" })
    .min(1, "请输入图标图片链接")
    .refine((value) => value.startsWith("/") || /^https?:\/\//.test(value), {
      message: "请输入正确的图片链接"
    })
});

const linkListModalFormRef = useTemplateRef("linkListModalFormRef");

/**
 * 根据类型读取/写入列表，避免列定义依赖可变的全局状态（否则会出现编辑/删除作用到错误列表的问题）。
 */
const getLinkListByType = (type: "website" | "project") => {
  return type === "website" ? formData.website_list : formData.project_list;
};

const setLinkListByType = (type: "website" | "project", next: IClientConfigMePageLinkItem[]) => {
  if (type === "website") {
    formData.website_list = next;
  } else {
    formData.project_list = next;
  }
};

const getActiveLinkList = () => getLinkListByType(linkListModalState.type);
const setActiveLinkList = (next: IClientConfigMePageLinkItem[]) =>
  setLinkListByType(linkListModalState.type, next);

const openAddLinkListModal = (type: "website" | "project") => {
  linkListModalState.type = type;
  linkListModalState.editingIndex = null;
  linkListModalForm.title = "";
  linkListModalForm.desc = "";
  linkListModalForm.href = "";
  linkListModalForm.icon = "";
  linkListModalState.visible = true;
};

const openEditLinkListModal = (type: "website" | "project", index: number) => {
  linkListModalState.type = type;
  const list = getActiveLinkList();
  const item = list[index];
  if (!item) return;
  linkListModalState.editingIndex = index;
  linkListModalForm.title = item.title;
  linkListModalForm.desc = item.desc;
  linkListModalForm.href = item.href;
  linkListModalForm.icon = item.icon;
  linkListModalState.visible = true;
};

const submitLinkListModal = (event: FormSubmitEvent<z.output<typeof linkListModalSchema>>) => {
  const list = [...getActiveLinkList()];
  const nextItem: IClientConfigMePageLinkItem = {
    title: event.data.title,
    desc: event.data.desc,
    href: event.data.href,
    icon: event.data.icon
  };

  if (linkListModalState.editingIndex === null) {
    list.push(nextItem);
  } else if (list[linkListModalState.editingIndex]) {
    list[linkListModalState.editingIndex] = nextItem;
  }

  setActiveLinkList(list);
  linkListModalState.visible = false;
};

const confirmLinkListModal = () => {
  linkListModalFormRef.value?.submit();
};

const createLinkListColumns = (
  type: "website" | "project"
): TableColumn<IClientConfigMePageLinkItem>[] => [
  {
    accessorKey: "icon",
    header: "图标",
    cell: ({ row }) => {
      const icon = row.original.icon;
      const isImageLink = icon.startsWith("/") || /^https?:\/\//.test(icon);
      if (!isImageLink) {
        return h(UIcon, { name: icon });
      }
      return h("img", {
        src: icon,
        alt: row.original.title,
        loading: "lazy",
        decoding: "async",
        class: "w-8 h-8 object-contain"
      });
    }
  },
  { accessorKey: "title", header: "标题" },
  { accessorKey: "desc", header: "描述" },
  {
    accessorKey: "href",
    header: "链接",
    cell: ({ row }) => {
      const href = row.original.href;
      return h(
        "a",
        {
          href,
          target: "_blank",
          rel: "noopener noreferrer",
          class: "text-primary block w-40 overflow-hidden whitespace-nowrap text-ellipsis"
        },
        href
      );
    }
  },
  {
    id: "actions",
    header: "操作",
    meta: {
      class: {
        th: "text-right",
        td: "text-right"
      }
    },
    cell: ({ row }) => {
      const idx = row.index;
      return h("div", { class: "flex justify-end gap-2" }, [
        h(UButton, {
          size: "xs",
          color: "primary",
          variant: "ghost",
          icon: "ep:edit",
          onClick: () => openEditLinkListModal(type, idx)
        }),
        h(UButton, {
          size: "xs",
          color: "error",
          variant: "ghost",
          icon: "ep:delete",
          onClick: () => {
            const list = getLinkListByType(type).filter((_, i) => i !== idx);
            setLinkListByType(type, list);
          }
        })
      ]);
    }
  }
];

const websiteListColumns = createLinkListColumns("website");
const projectListColumns = createLinkListColumns("project");

/**
 * =========================
 * Social Links（social_links）
 * =========================
 */
const socialLinkModalState = reactive<{
  visible: boolean;
  editingIndex: number | null;
}>({
  visible: false,
  editingIndex: null
});

const socialLinkModalForm = reactive<IClientConfigMePageSocialLinkItem>({
  title: undefined,
  href: "",
  icon: "ep:link",
  hover_bg: undefined,
  target: "_blank"
});

const socialLinkModalSchema = z.object({
  title: z.string().optional(),
  href: z.string({ message: "请输入链接" }).url("请输入正确的链接"),
  icon: z.string({ message: "请选择图标" }).min(1, "请选择图标"),
  hover_bg: z.string().optional(),
  target: z.string().optional()
});

const socialLinkModalFormRef = useTemplateRef("socialLinkModalFormRef");

const openAddSocialLinkModal = () => {
  socialLinkModalForm.title = undefined;
  socialLinkModalForm.href = "";
  socialLinkModalForm.icon = "ep:link";
  socialLinkModalForm.hover_bg = undefined;
  socialLinkModalForm.target = "_blank";
  socialLinkModalState.editingIndex = null;
  socialLinkModalState.visible = true;
};

const openEditSocialLinkModal = (index: number) => {
  const item = formData.social_links[index];
  if (!item) return;
  socialLinkModalForm.title = item.title;
  socialLinkModalForm.href = item.href;
  socialLinkModalForm.icon = item.icon;
  socialLinkModalForm.hover_bg = item.hover_bg;
  socialLinkModalForm.target = item.target ?? "_blank";
  socialLinkModalState.editingIndex = index;
  socialLinkModalState.visible = true;
};

const submitSocialLinkModal = (event: FormSubmitEvent<z.output<typeof socialLinkModalSchema>>) => {
  const nextItem: IClientConfigMePageSocialLinkItem = {
    title: event.data.title,
    href: event.data.href,
    icon: event.data.icon,
    hover_bg: event.data.hover_bg,
    target: event.data.target
  };

  if (socialLinkModalState.editingIndex === null) {
    formData.social_links.push(nextItem);
  } else {
    const idx = socialLinkModalState.editingIndex;
    if (formData.social_links[idx]) formData.social_links[idx] = nextItem;
  }

  socialLinkModalState.visible = false;
};

const confirmSocialLinkModal = () => {
  socialLinkModalFormRef.value?.submit();
};

const socialLinkColumns: TableColumn<IClientConfigMePageSocialLinkItem>[] = [
  {
    accessorKey: "icon",
    header: "图标",
    cell: ({ row }) => h(UIcon, { name: row.original.icon })
  },
  { accessorKey: "title", header: "标题" },
  {
    accessorKey: "href",
    header: "链接",
    cell: ({ row }) => {
      const href = row.original.href;
      return h(
        "a",
        {
          href,
          target: "_blank",
          rel: "noopener noreferrer",
          class: "text-primary block w-40 overflow-hidden whitespace-nowrap text-ellipsis"
        },
        href
      );
    }
  },
  { accessorKey: "hover_bg", header: "Hover 背景" },
  { accessorKey: "target", header: "Target" },
  {
    id: "actions",
    header: "操作",
    meta: {
      class: {
        th: "text-right",
        td: "text-right"
      }
    },
    cell: ({ row }) => {
      const idx = row.index;
      return h("div", { class: "flex justify-end gap-2" }, [
        h(UButton, {
          size: "xs",
          color: "primary",
          variant: "ghost",
          icon: "ep:edit",
          onClick: () => openEditSocialLinkModal(idx)
        }),
        h(UButton, {
          size: "xs",
          color: "error",
          variant: "ghost",
          icon: "ep:delete",
          onClick: () => {
            formData.social_links = formData.social_links.filter((_, i) => i !== idx);
          }
        })
      ]);
    }
  }
];

/**
 * =========================
 * FAQ（faq_items）
 * =========================
 */
const faqModalState = reactive<{
  visible: boolean;
  editingIndex: number | null;
}>({
  visible: false,
  editingIndex: null
});

const faqModalForm = reactive<IClientConfigMePageFaqItem>({
  label: "",
  content: ""
});

const faqModalSchema = z.object({
  label: z.string({ message: "请输入问题" }).min(1, "请输入问题"),
  content: z.string({ message: "请输入回答内容" }).min(1, "请输入回答内容")
});

const faqModalFormRef = useTemplateRef("faqModalFormRef");

const openAddFaqModal = () => {
  faqModalForm.label = "";
  faqModalForm.content = "";
  faqModalState.editingIndex = null;
  faqModalState.visible = true;
};

const openEditFaqModal = (index: number) => {
  const item = formData.faq_items[index];
  if (!item) return;
  faqModalForm.label = item.label;
  faqModalForm.content = item.content;
  faqModalState.editingIndex = index;
  faqModalState.visible = true;
};

const submitFaqModal = (event: FormSubmitEvent<z.output<typeof faqModalSchema>>) => {
  const nextItem: IClientConfigMePageFaqItem = {
    label: event.data.label,
    content: event.data.content
  };
  if (faqModalState.editingIndex === null) {
    formData.faq_items.push(nextItem);
  } else {
    const idx = faqModalState.editingIndex;
    if (formData.faq_items[idx]) formData.faq_items[idx] = nextItem;
  }
  faqModalState.visible = false;
};

const confirmFaqModal = () => {
  faqModalFormRef.value?.submit();
};

const faqColumns: TableColumn<IClientConfigMePageFaqItem>[] = [
  { accessorKey: "label", header: "问题" },
  {
    accessorKey: "content",
    header: "回答",
    cell: ({ row }) => {
      const text = row.original.content || "";
      return h("div", { class: "w-56 whitespace-nowrap overflow-hidden text-ellipsis" }, text);
    }
  },
  {
    id: "actions",
    header: "操作",
    meta: {
      class: {
        th: "text-right",
        td: "text-right"
      }
    },
    cell: ({ row }) => {
      const idx = row.index;
      return h("div", { class: "flex justify-end gap-2" }, [
        h(UButton, {
          size: "xs",
          color: "primary",
          variant: "ghost",
          icon: "ep:edit",
          onClick: () => openEditFaqModal(idx)
        }),
        h(UButton, {
          size: "xs",
          color: "error",
          variant: "ghost",
          icon: "ep:delete",
          onClick: () => {
            formData.faq_items = formData.faq_items.filter((_, i) => i !== idx);
          }
        })
      ]);
    }
  }
];
</script>

<template>
  <SettingCard
    title="个人页（Me）配置"
    :is-change="state.isChange"
    :submitting="state.submitting"
    @reset="handleReset"
    @save="handleSave"
  >
    <UForm
      ref="formRef"
      class="space-y-2"
      :schema="schema"
      :state="formData"
      :validate-on-input-delay="100"
      @submit="handleSubmit"
    >
      <UFormField
        label="头像"
        description="个人页头像（me_page.author.avatar）；留空将回退到默认头像"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.author.avatar"
          class="w-full"
          icon="i-lucide-link"
          placeholder="https://... 或 /images/avatar.webp"
        />
      </UFormField>

      <UFormField
        name="author.name"
        label="作者名称"
        description="个人页左侧卡片展示的名称"
        required
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput v-model="formData.author.name" class="w-full" placeholder="请输入作者名称" />
      </UFormField>

      <UFormField
        name="author.location"
        label="所在地"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput v-model="formData.author.location" class="w-full" placeholder="例如：成都" />
      </UFormField>

      <UFormField
        name="author.dev_role"
        label="职位/角色"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput v-model="formData.author.dev_role" class="w-full" placeholder="例如：前端工程师" />
      </UFormField>

      <UFormField
        name="author.dev_direction"
        label="方向"
        description="显示在 Hello 标题下方的那一行"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.author.dev_direction"
          class="w-full"
          placeholder="例如：Web / Full Stack"
        />
      </UFormField>

      <UFormField
        name="author.quote"
        label="简介/座右铭"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UTextarea
          v-model="formData.author.quote"
          class="w-full"
          :rows="3"
          placeholder="一句话介绍"
        />
      </UFormField>

      <UFormField
        label="个人标签"
        description="个人页左侧头像下方的标签列表"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <template #hint>
          <UButton size="xs" icon="ep:plus" @click="openAddProfileTagModal"> 添加 </UButton>
        </template>
        <div class="border border-muted rounded-md overflow-hidden">
          <UTable
            :data="formData.author.tags"
            :columns="profileTagColumns"
            sticky
            class="max-h-64"
          />
        </div>
      </UFormField>

      <UFormField
        name="github_snake.light"
        label="GitHub Snake（亮色）"
        description="建议填写图片 URL"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.github_snake.light"
          class="w-full"
          icon="i-lucide-link"
          placeholder="https://..."
        />
      </UFormField>

      <UFormField
        name="github_snake.dark"
        label="GitHub Snake（暗色）"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.github_snake.dark"
          class="w-full"
          icon="i-lucide-link"
          placeholder="https://..."
        />
      </UFormField>

      <UFormField
        label="基础信息（Base Info）"
        description="支持配置年龄/工作经验等；个人页会根据“年龄/工作经验”自动做年份计算"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <template #hint>
          <UButton size="xs" icon="ep:plus" @click="openAddBaseInfoModal"> 添加 </UButton>
        </template>
        <div class="border border-muted rounded-md overflow-hidden">
          <UTable
            :data="formData.intro.base_info"
            :columns="baseInfoColumns"
            sticky
            class="max-h-64"
          />
        </div>
      </UFormField>

      <UFormField
        label="相关技能（列表）"
        description="对应个人页的“相关技能”有序列表"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <InputTagArea v-model="formData.intro.skills" label="添加技能" />
      </UFormField>

      <UFormField
        label="兴趣标签"
        description="对应个人页的“我的兴趣”"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <InputTagArea v-model="formData.intro.interest_tags" label="添加兴趣" />
      </UFormField>

      <UFormField
        label="语言能力"
        description="对应个人页的“语言能力”"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <InputTagArea v-model="formData.intro.language_proficiency" label="添加语言" />
      </UFormField>

      <UFormField
        label="技能卡片（Grid）"
        description="对应个人页 Projects Tab 下的技能卡片区域"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <template #hint>
          <UButton size="xs" icon="ep:plus" @click="openAddSkillGridModal"> 添加 </UButton>
        </template>
        <div class="border border-muted rounded-md overflow-hidden">
          <UTable
            :data="formData.skills_grid"
            :columns="skillGridColumns"
            sticky
            class="max-h-64"
          />
        </div>
      </UFormField>

      <UFormField
        label="网站（Website List）"
        description="对应个人页 Projects Tab 下的“网站”卡片列表"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <template #hint>
          <UButton size="xs" icon="ep:plus" @click="openAddLinkListModal('website')">
            添加
          </UButton>
        </template>
        <div class="border border-muted rounded-md overflow-hidden">
          <UTable
            :data="formData.website_list"
            :columns="websiteListColumns"
            sticky
            class="max-h-64"
          />
        </div>
      </UFormField>

      <UFormField
        label="项目（Project List）"
        description="对应个人页 Projects Tab 下的“项目”卡片列表"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <template #hint>
          <UButton size="xs" icon="ep:plus" @click="openAddLinkListModal('project')">
            添加
          </UButton>
        </template>
        <div class="border border-muted rounded-md overflow-hidden">
          <UTable
            :data="formData.project_list"
            :columns="projectListColumns"
            sticky
            class="max-h-64"
          />
        </div>
      </UFormField>

      <UFormField
        label="社交链接（Social Links）"
        description="个人页头像下方的社交按钮列表"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <template #hint>
          <UButton size="xs" icon="ep:plus" @click="openAddSocialLinkModal"> 添加 </UButton>
        </template>
        <div class="border border-muted rounded-md overflow-hidden">
          <UTable
            :data="formData.social_links"
            :columns="socialLinkColumns"
            sticky
            class="max-h-64"
          />
        </div>
      </UFormField>

      <UFormField
        label="FAQ"
        description="对应个人页 FAQ Tab 的折叠面板内容"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <template #hint>
          <UButton size="xs" icon="ep:plus" @click="openAddFaqModal"> 添加 </UButton>
        </template>
        <div class="border border-muted rounded-md overflow-hidden">
          <UTable :data="formData.faq_items" :columns="faqColumns" sticky class="max-h-64" />
        </div>
      </UFormField>
    </UForm>

    <BasicModal
      v-model:visible="profileTagModalState.visible"
      :title="profileTagModalState.editingIndex === null ? '添加标签' : '编辑标签'"
      @confirm="confirmProfileTagModal"
    >
      <UForm
        ref="profileTagModalFormRef"
        :state="profileTagModalForm"
        :schema="profileTagModalSchema"
        :validate-on-input-delay="100"
        @submit="submitProfileTagModal"
      >
        <UFormField name="label" label="标签文本" required>
          <UInput v-model="profileTagModalForm.label" placeholder="例如：独立开发" />
        </UFormField>
        <UFormField name="color" label="颜色">
          <USelect v-model="profileTagModalForm.color" :items="badgeColorOptions" />
        </UFormField>
      </UForm>
    </BasicModal>

    <BasicModal
      v-model:visible="baseInfoModalState.visible"
      :title="baseInfoModalState.editingIndex === null ? '添加基础信息' : '编辑基础信息'"
      @confirm="confirmBaseInfoModal"
    >
      <UForm
        ref="baseInfoModalFormRef"
        :state="baseInfoModalForm"
        :schema="baseInfoModalSchema"
        :validate-on-input-delay="100"
        @submit="submitBaseInfoModal"
      >
        <UFormField name="label" label="标题" required>
          <UInput v-model="baseInfoModalForm.label" placeholder="例如：年龄 / 工作经验" />
        </UFormField>
        <UFormField name="value" label="内容" required>
          <UInput v-model="baseInfoModalForm.value" placeholder="例如：2000-01-01 / 2020-01" />
        </UFormField>
        <UFormField name="icon" label="图标" required>
          <SelectIcon v-model="baseInfoModalForm.icon" />
        </UFormField>
        <UFormField name="href" label="链接（可选）">
          <UInput v-model="baseInfoModalForm.href" icon="ep:link" placeholder="https://..." />
        </UFormField>
      </UForm>
    </BasicModal>

    <BasicModal
      v-model:visible="skillGridModalState.visible"
      :title="skillGridModalState.editingIndex === null ? '添加技能卡片' : '编辑技能卡片'"
      @confirm="confirmSkillGridModal"
    >
      <UForm
        ref="skillGridModalFormRef"
        :state="skillGridModalForm"
        :schema="skillGridModalSchema"
        :validate-on-input-delay="100"
        @submit="submitSkillGridModal"
      >
        <UFormField name="title" label="标题" required>
          <UInput v-model="skillGridModalForm.title" placeholder="例如：TypeScript" />
        </UFormField>
        <UFormField name="icon" label="图标" required>
          <SelectIcon v-model="skillGridModalForm.icon" />
        </UFormField>
        <UFormField name="href" label="链接（可选）">
          <UInput v-model="skillGridModalForm.href" icon="ep:link" placeholder="https://..." />
        </UFormField>
      </UForm>
    </BasicModal>

    <BasicModal
      v-model:visible="linkListModalState.visible"
      :title="linkListModalState.editingIndex === null ? '添加卡片' : '编辑卡片'"
      @confirm="confirmLinkListModal"
    >
      <UForm
        ref="linkListModalFormRef"
        :state="linkListModalForm"
        :schema="linkListModalSchema"
        :validate-on-input-delay="100"
        @submit="submitLinkListModal"
      >
        <UFormField name="title" label="标题" required>
          <UInput v-model="linkListModalForm.title" placeholder="例如：我的博客" />
        </UFormField>
        <UFormField name="desc" label="描述" required>
          <UInput v-model="linkListModalForm.desc" placeholder="一句话描述" />
        </UFormField>
        <UFormField name="href" label="链接" required>
          <UInput v-model="linkListModalForm.href" icon="ep:link" placeholder="https://..." />
        </UFormField>
        <UFormField
          name="icon"
          label="图标图片链接"
          description="用于卡片右侧图标展示（建议 64x64 或 128x128，支持 https://... 或 /images/..."
          required
          :ui="{
            description: 'text-xs',
            container: 'mt-2'
          }"
        >
          <UInput v-model="linkListModalForm.icon" icon="ep:link" placeholder="请输入图片链接" />
        </UFormField>
      </UForm>
    </BasicModal>

    <BasicModal
      v-model:visible="socialLinkModalState.visible"
      :title="socialLinkModalState.editingIndex === null ? '添加社交链接' : '编辑社交链接'"
      @confirm="confirmSocialLinkModal"
    >
      <UForm
        ref="socialLinkModalFormRef"
        :state="socialLinkModalForm"
        :schema="socialLinkModalSchema"
        :validate-on-input-delay="100"
        @submit="submitSocialLinkModal"
      >
        <UFormField name="title" label="标题（可选）">
          <UInput v-model="socialLinkModalForm.title" placeholder="例如：GitHub" />
        </UFormField>
        <UFormField name="href" label="链接" required>
          <UInput v-model="socialLinkModalForm.href" icon="ep:link" placeholder="https://..." />
        </UFormField>
        <UFormField name="icon" label="图标" required>
          <SelectIcon v-model="socialLinkModalForm.icon" />
        </UFormField>
        <UFormField name="hover_bg" label="Hover 背景（可选）">
          <UInput
            v-model="socialLinkModalForm.hover_bg"
            placeholder="例如：#000 或 var(--color-gray-700)"
          />
        </UFormField>
        <UFormField name="target" label="Target（可选）">
          <UInput v-model="socialLinkModalForm.target" placeholder="_blank" />
        </UFormField>
      </UForm>
    </BasicModal>

    <BasicModal
      v-model:visible="faqModalState.visible"
      :title="faqModalState.editingIndex === null ? '添加 FAQ' : '编辑 FAQ'"
      @confirm="confirmFaqModal"
    >
      <UForm
        ref="faqModalFormRef"
        :state="faqModalForm"
        :schema="faqModalSchema"
        :validate-on-input-delay="100"
        @submit="submitFaqModal"
      >
        <UFormField name="label" label="问题" required>
          <UInput v-model="faqModalForm.label" placeholder="例如：你在做什么？" />
        </UFormField>
        <UFormField name="content" label="回答" required>
          <UTextarea v-model="faqModalForm.content" :rows="5" placeholder="请输入回答内容" />
        </UFormField>
      </UForm>
    </BasicModal>
  </SettingCard>
</template>
