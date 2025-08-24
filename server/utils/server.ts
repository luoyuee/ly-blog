import { UAParser } from "ua-parser-js";
import { useIPLocation } from "./ip";

export function getDeviceInfo(
  userAgent: string | null | undefined,
  ip: string | null | undefined
): {
  browser: string | null;
  platform: string | null;
  location: string | null;
} {
  const { getIPLocation } = useIPLocation();

  let browser: string | null = null;
  let platform: string | null = null;
  let location: string | null = null;

  if (userAgent) {
    const uap = new UAParser(userAgent);

    const browserInfo = uap.getBrowser();

    if (browserInfo.name) browser = browserInfo.name;
    if (browserInfo.version) browser += " " + browserInfo.version;

    const os = uap.getOS();

    if (os.name) platform = os.name;
    if (os.version) platform += " " + os.version;
  }

  if (ip) {
    location = getIPLocation(ip);
  }

  return {
    browser,
    platform,
    location
  };
}
