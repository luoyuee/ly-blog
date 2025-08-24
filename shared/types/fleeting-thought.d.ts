export interface FleetingThought {
  id: number;
  created_at: number;
  content: string;
  public: boolean;
  ip?: string;
  location?: string;
  platform?: string;
  browser?: string;
}
