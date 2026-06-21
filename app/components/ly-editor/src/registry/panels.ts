import type { LyEditorPanelRegistryItem } from "#shared/types/ly-editor";
import { LyEditorTabPanelEnum } from "#shared/enums";
import {
  ApiKeyPanel,
  AttachmentFolderPanel,
  ArticlePanel,
  CronJobPanel,
  DashboardPanel,
  HitokotoPanel,
  ImageFolderPanel,
  SearchHistoryPanel,
  NavigationWebsitePanel,
  SettingPanel,
  UserPanel
} from "@ly-editor/src/modules";

/**
 * 工作台面板注册表。
 */
export const lyEditorPanelRegistry = {
  [LyEditorTabPanelEnum.ArticlePanel]: {
    component: ArticlePanel,
    keepAlive: true
  },
  [LyEditorTabPanelEnum.ImagePanel]: {
    component: ImageFolderPanel,
    keepAlive: true
  },
  [LyEditorTabPanelEnum.AttachmentPanel]: {
    component: AttachmentFolderPanel,
    keepAlive: true
  },
  [LyEditorTabPanelEnum.HitokotoPanel]: {
    component: HitokotoPanel,
    keepAlive: true
  },
  [LyEditorTabPanelEnum.NavigationWebsitePanel]: {
    component: NavigationWebsitePanel,
    keepAlive: true
  },
  [LyEditorTabPanelEnum.NavigationHistoryPanel]: {
    component: SearchHistoryPanel,
    keepAlive: true
  },
  [LyEditorTabPanelEnum.ApiKeyPanel]: {
    component: ApiKeyPanel,
    keepAlive: true
  },
  [LyEditorTabPanelEnum.DashboardPanel]: {
    component: DashboardPanel,
    keepAlive: true
  },
  [LyEditorTabPanelEnum.CronJobPanel]: {
    component: CronJobPanel,
    keepAlive: true
  },
  [LyEditorTabPanelEnum.SettingPanel]: {
    component: SettingPanel,
    keepAlive: true
  },
  [LyEditorTabPanelEnum.UserPanel]: {
    component: UserPanel,
    keepAlive: true
  }
} satisfies Record<string, LyEditorPanelRegistryItem>;

export type LyEditorPanelKey = keyof typeof lyEditorPanelRegistry;
