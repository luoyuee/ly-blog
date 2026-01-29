export interface RequestStatsValue {
  article: number;
  like: number;
  api: number;
  page: number;
  static: number;
  total: number;
}

export type HourlyRequestSummary = {
  [key: string]: RequestStatsValue;
};

export interface IpRequestStatsValue {
  total: number;
  location: string;
}

export type IpRequestSummary = {
  [key: string]: IpRequestStatsValue;
};

export interface DailyStatistics {
  date: string;
  totalRequests: RequestStatsValue;
  hourlyRequests: HourlyRequestSummary;
  ipRequests: IpRequestSummary;
}
