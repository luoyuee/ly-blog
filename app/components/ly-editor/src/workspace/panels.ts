import type { WorkspacePanelRegistryItem } from "../types/tabs";
import { LyEditorTabPanelEnum } from "@@/shared/enums";
import { ArticlePaneContent, CronJobPanel, DashboardPanel, HitokotoPaneContent, ImageFolderPanel, SettingPanel, UserPanel } from "../modules";
import { NavigationWebsitePaneContent } from "../modules";

/**
 * 工作台面板注册表。
 *
 * 具体组件会在迁移 TabPane 阶段逐步接入。
 */
export const workspacePanelRegistry = {
  [LyEditorTabPanelEnum.ArticlePanel]: {
    component: ArticlePaneContent,
    keepAlive: true
  },
  [LyEditorTabPanelEnum.ImagePanel]: {
    component: ImageFolderPanel,
    keepAlive: true
  },
  [LyEditorTabPanelEnum.HitokotoPanel]: {
    component: HitokotoPaneContent,
    keepAlive: true
  },
  [LyEditorTabPanelEnum.NavigationWebsitePanel]: {
    component: NavigationWebsitePaneContent,
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
} satisfies Record<string, WorkspacePanelRegistryItem>;
