<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import type {
  UpdateClientConfigRequest,
  UpdateMePageConfigRequest,
  UpdateServerConfigRequest
} from "@/apis/config/models";
import { useConfigStore, useMePageConfigStore, useServerConfigStore } from "@/stores";
import { ToolTipButton } from "@/components/tooltip-button";
import { cloneDeep, isPlainObject } from "es-toolkit";
import { useFileDialog } from "@vueuse/core";
import { downloadFile } from "@/utils/file";
import dayjs from "dayjs";

type ConfigScope = "client" | "server" | "me_page" | "all";

type ConfigExportFile = {
  version: 1;
  scope: ConfigScope;
  exported_at: string;
  data: unknown;
};

const configStore = useConfigStore();
const mePageConfigStore = useMePageConfigStore();
const serverConfigStore = useServerConfigStore();
const $notify = useNotification();
const pendingImportScope = ref<ConfigScope>("client");
const importing = ref(false);
const {
  open: openFileDialog,
  onChange: onFileChange,
  reset: resetFileDialog
} = useFileDialog({
  accept: ".json,application/json",
  multiple: false
});

const scopeLabels: Record<ConfigScope, string> = {
  client: "客户端配置",
  server: "服务端配置",
  me_page: "个人主页配置",
  all: "全部配置"
};

/** 移除接口管理的时间字段，仅保留客户端可更新配置。 */
const getClientConfig = (): UpdateClientConfigRequest => {
  const { created_at, updated_at, locale, ...data } = configStore.$state;
  return cloneDeep(data);
};

/** 移除接口管理的时间字段，仅保留服务端可更新配置。 */
const getServerConfig = (): UpdateServerConfigRequest => {
  const { created_at, updated_at, ...data } = serverConfigStore.$state;
  return cloneDeep(data);
};

const getMePageConfig = (): UpdateMePageConfigRequest => cloneDeep(mePageConfigStore.$state);

const getExportData = (scope: ConfigScope): unknown => {
  if (scope === "client") return getClientConfig();
  if (scope === "server") return getServerConfig();
  if (scope === "me_page") return getMePageConfig();

  return {
    client: getClientConfig(),
    server: getServerConfig(),
    me_page: getMePageConfig()
  };
};

/** 下载包含分类和版本信息的 JSON 配置文件。 */
const handleExport = (scope: ConfigScope) => {
  const file: ConfigExportFile = {
    version: 1,
    scope,
    exported_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    data: getExportData(scope)
  };

  downloadFile(file, `ly-blog-${scope}-config-${dayjs().format("YYYYMMDD-HHmmss")}.json`, {
    mimeType: "application/json;charset=utf-8"
  });

  $notify.success({ title: `${scopeLabels[scope]}已导出` });
};

/** 读取本组件导出的包装格式，同时兼容直接以配置对象作为文件内容。 */
const resolveImportData = (value: unknown, scope: ConfigScope): unknown => {
  if (!isPlainObject(value)) {
    throw new Error("JSON 顶层必须是对象");
  }

  if ("data" in value && "scope" in value) {
    if (value.scope !== scope) {
      throw new Error(`文件类型与所选的${scopeLabels[scope]}不一致`);
    }
    return value.data;
  }

  return value;
};

const updateScope = async (scope: Exclude<ConfigScope, "all">, data: unknown) => {
  if (!isPlainObject(data)) {
    throw new Error(`${scopeLabels[scope]}内容必须是对象`);
  }

  if (scope === "client") {
    await configStore.update(data as UpdateClientConfigRequest);
    return;
  }

  if (scope === "server") {
    await serverConfigStore.update(data as UpdateServerConfigRequest);
    return;
  }
  if (scope === "me_page") {
    await mePageConfigStore.update(data as UpdateMePageConfigRequest);
  }
};

/** 按用户选择的分类持久化配置；全部配置依次更新三个配置源。 */
const importConfig = async (scope: ConfigScope, value: unknown) => {
  const data = resolveImportData(value, scope);

  if (scope !== "all") {
    await updateScope(scope, data);
    return;
  }
  if (!isPlainObject(data)) {
    throw new Error("全部配置必须包含 client、server 和 me_page 对象");
  }

  await updateScope("client", data.client);
  await updateScope("server", data.server);
  await updateScope("me_page", data.me_page);
};

const openImportFile = (scope: ConfigScope) => {
  pendingImportScope.value = scope;
  openFileDialog();
};

onFileChange(async (files) => {
  const file = files?.[0];

  if (!file) return;

  importing.value = true;
  try {
    const content = await file.text();
    const value: unknown = JSON.parse(content);
    await importConfig(pendingImportScope.value, value);
    $notify.success({ title: `${scopeLabels[pendingImportScope.value]}已导入` });
  } catch (error) {
    $notify.error({ title: "导入配置失败", error });
  } finally {
    importing.value = false;
    resetFileDialog();
  }
});

const createMenuItems = (handler: (scope: ConfigScope) => void): DropdownMenuItem[] => [
  { label: "客户端", icon: "lucide:monitor", onSelect: () => handler("client") },
  { label: "服务端", icon: "lucide:server", onSelect: () => handler("server") },
  { label: "个人主页", icon: "lucide:user-round", onSelect: () => handler("me_page") },
  { label: "全部配置", icon: "lucide:boxes", onSelect: () => handler("all") }
];

const importMenuItems = createMenuItems(openImportFile);
const exportMenuItems = createMenuItems(handleExport);
</script>

<template>
  <div class="flex items-center justify-end gap-2">
    <UDropdownMenu :items="importMenuItems" size="sm">
      <ToolTipButton
        size="sm"
        icon="mdi:import"
        variant="outline"
        tooltip="导入配置"
        label="导入"
        :loading="importing"
      />
    </UDropdownMenu>

    <UDropdownMenu :items="exportMenuItems" size="sm">
      <ToolTipButton
        size="sm"
        icon="mdi:export"
        variant="outline"
        tooltip="导出配置"
        label="导出"
      />
    </UDropdownMenu>
  </div>
</template>
