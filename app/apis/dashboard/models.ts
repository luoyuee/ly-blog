export interface DashboardData {
  total: number;
  x: string[];
  y: number[];
  today: number;
}

export interface ArticleDashboard {
  total: number;
  x: string[];
  y: number[];
  today_created: number;
  today_updated: number;
}

export interface NoteDashboard {
  total: number;
  x: string[];
  y: number[];
  today_created: number;
  today_updated: number;
}

export interface ImageDashboard {
  total: number;
  x: string[];
  series: number[][];
  storage_size: number;
  today_upload: number;
}

export interface OverviewDashboard {
  x: string[];
  series: number[][];
}
