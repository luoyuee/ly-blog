export type ArchiveLogLevel = "http" | "info" | "warn" | "error" | "debug";

export interface ArchiveHttpLogContent {
  time: string;
  level: ArchiveLogLevel;
  method: string;
  path: string;
  ip: string;
  userAgent: string;
}

export type ArchiveLogData =
  | Record<string, unknown>
  | string
  | number
  | boolean
  | null
  | undefined
  | unknown[]
  | Error
  | Date
  | Map<string, unknown>
  | Set<unknown>;
