import type { LyEditorPanelRegistryItem } from "#shared/types/ly-editor";
import { LyEditorTabPanel } from "#shared/constants";
import {
  ArticlePaneContent,
  CronJobPanel,
  DashboardPanel,
  HitokotoPanel,
  ImageFolderPanel,
  NavigationWebsitePaneContent,
  SettingPanel,
  UserPanel
} from "../modules";

/**
 * 工作台面板注册表。
 */
export const lyEditorPanelRegistry = {
  [LyEditorTabPanel.ArticlePanel]: {
    component: ArticlePaneContent,
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
    component: NavigationWebsitePaneContent,
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
