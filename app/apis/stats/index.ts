import type { VisitsStats } from "./models";
import request from "@/utils/request";

export const getVisitsStats = (): Promise<VisitsStats> => {
  return request({
    url: "/stats/visits",
    method: "get"
  });
};
