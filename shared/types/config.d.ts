export interface IClientConfigBasic {
  title: string;
  site_url?: string;
  description: string;
  keywords?: string[];
  notice?: string;
}

export interface IClientConfigAuthorCard {
  name: string;
  name_link?: string;
  avatar?: string;
  motto?: string;
  links?: {
    title: string;
    href: string;
  }[];
  link_icon?: string;
}

export interface IClientConfigExternalLink {
  title: string;
  href: string;
  icon?: string;
}

export interface IClientConfigBackground {
  home_page_bg?: string;
  home_title?: string;
  home_sub_title?: string;
  article_page_bg?: string;
  catalog_page_bg?: string;
  tag_page_bg?: string;
}

export interface IClientConfigSwiperItem {
  title: string;
  href: string;
  image: string;
}

export interface IClientConfigNavMenuItem {
  id: number;
  title: string;
  href?: string | null;
  icon?: string | null;
  show: boolean;
  children?: IClientConfigNavMenuItem[] | null;
}

export interface IClientConfigBeian {
  beian_code?: string;
  icp_code?: string;
}

export interface IClientConfigHitokoto {
  max_length?: number;
  type?: number[];
}

export interface IClientConfigArticle {
  comment_max_length?: number;
  payment_qr_code?: { name: string; image: string }[];
}

export interface IClientConfigMessageBoard {
  intro?: string;
  message_max_length?: number;
}

export interface IClientConfigFleetingThought {
  intro?: string;
}

export interface IClientConfig {
  created_at?: number;
  updated_at?: number;
  locale: string;
  basic: IClientConfigBasic;
  author_card: IClientConfigAuthorCard;
  external_link_card: IClientConfigExternalLink[];
  background: IClientConfigBackground;
  swiper: IClientConfigSwiperItem[];
  nav_menu: IClientConfigNavMenuItem[];
  beian: IClientConfigBeian;
  hitokoto: IClientConfigHitokoto;
  article: IClientConfigArticle;
  message_board: IClientConfigMessageBoard;
  fleeting_thought: IClientConfigFleetingThought;
}

//========== 系统设置 ==========

export interface IServerConfigMailer {
  host?: string;
  port?: number;
  tls?: boolean;
  user?: string;
  pass?: string;
  notif_email?: string;
  enable_comment_notif?: boolean;
  enable: boolean;
}

export interface IServerConfigStorage {
  type?: "local" | "minio";
  base_path?: string;
  end_point?: string;
  url_format?: string;
  port?: number;
  region?: string;
  bucket?: string;
  use_ssl?: boolean;
  access_key?: string;
  secret_key?: string;
}

export interface IServerConfig {
  created_at?: number;
  updated_at?: number;
  mailer: IServerConfigMailer;
  storage: IServerConfigStorage;
}

//========== 作品 ==========
export interface WorkItem {
  name: string;
  icon: string;
  description: string;
  image: string;
  languages: string[];
  repoUrl: string;
}

export type WorkForm = Partial<WorkItem>;
