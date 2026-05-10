import type { LyEditorPanelRegistryItem } from "#shared/types/ly-editor";
import { LyEditorTabPanel } from "#shared/constants";
import {
  ArticlePanel,
  CronJobPanel,
  DashboardPanel,
  HitokotoPanel,
  ImageFolderPanel,
  SearchHistoryPanel,
  NavigationWebsitePanel,
  SettingPanel,
  UserPanel
} from "../modules";

/**
 * 工作台面板注册表。
 */
export const lyEditorPanelRegistry = {
  [LyEditorTabPanel.ArticlePanel]: {
    component: ArticlePanel,
    keepAlive: true
  },
  [LyEditorTabPanel.ImagePanel]: {
    component: ImageFolderPanel,
    keepAlive: true
  },
  [LyEditorTabPanel.HitokotoPanel]: {
    component: HitokotoPanel,
    keepAlive: true
  },
  [LyEditorTabPanel.NavigationWebsitePanel]: {
    component: NavigationWebsitePanel,
    keepAlive: true
  },
  [LyEditorTabPanel.NavigationHistoryPanel]: {
    component: SearchHistoryPanel,
    keepAlive: true
  },
  [LyEditorTabPanel.DashboardPanel]: {
    component: DashboardPanel,
    keepAlive: true
  },
  [LyEditorTabPanel.CronJobPanel]: {
    component: CronJobPanel,
    keepAlive: true
  },
  [LyEditorTabPanel.SettingPanel]: {
    component: SettingPanel,
    keepAlive: true
  },
  [LyEditorTabPanel.UserPanel]: {
    component: UserPanel,
    keepAlive: true
  }
} satisfies Record<string, LyEditorPanelRegistryItem>;
