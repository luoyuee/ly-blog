import type { AuditTrailKeys } from "./common";

export interface NavigationWebsiteItem {
  id: number;
  created_at?: Date;
  created_by?: number;
  updated_at?: Date;
  updated_by?: number;
  name: string;
  url: string;
  icon?: string;
  tags?: string[];
  description?: string;
  status: number;
}

export type NavigationWebsiteForm = Partial<Omit<NavigationWebsiteItem, AuditTrailKeys>> & {};
