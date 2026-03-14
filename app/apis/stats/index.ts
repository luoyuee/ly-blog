import type { VisitsStats } from "./models";
import { serviceAxios } from "@/utils/request";

export async function getVisitsStats(): Promise<VisitsStats> {
  try {
    const response = await serviceAxios({
      url: "/stats/visits",
      method: "get"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
