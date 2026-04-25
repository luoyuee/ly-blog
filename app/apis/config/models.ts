import type {
  IClientConfig,
  IClientConfigBasic,
  IClientConfigAuthorCard,
  IClientConfigBackground,
  IClientConfigSwiperItem,
  IClientConfigNavMenuItem,
  IClientConfigHitokoto,
  IClientConfigBeian,
  IClientConfigArticle,
  IClientConfigMessageBoard,
  IClientConfigFleetingThought,
  IMePageConfig,
  IServerConfigMailer,
  IServerConfigStorage,
  IServerConfigCzdb,
  IClientConfigExternalLink,
  IClientConfigLive2d
} from "#shared/types/config";

export interface UpdateClientConfigRequest {
  basic?: IClientConfigBasic;
  author_card?: IClientConfigAuthorCard;
  external_link_card?: IClientConfigExternalLink[];
  background?: IClientConfigBackground;
  swiper?: IClientConfigSwiperItem[];
  nav_menu?: IClientConfigNavMenuItem[];
  beian?: IClientConfigBeian;
  hitokoto?: IClientConfigHitokoto;
  article?: IClientConfigArticle;
  message_board?: IClientConfigMessageBoard;
  fleeting_thought?: IClientConfigFleetingThought;
  live2d?: IClientConfigLive2d;
}

export type GetClientConfigResponse = IClientConfig;

export type GetMePageConfigResponse = IMePageConfig;

export type UpdateMePageConfigRequest = IMePageConfig;

export interface UpdateServerConfigRequest {
  mailer?: IServerConfigMailer;
  storage?: IServerConfigStorage;
  czdb?: IServerConfigCzdb;
}
