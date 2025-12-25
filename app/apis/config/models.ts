import type {
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
  IServerConfigMailer,
  IServerConfigStorage,
  IClientConfigExternalLink,
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
}

export interface UpdateServerConfigRequest {
  mailer?: IServerConfigMailer;
  storage?: IServerConfigStorage;
}
