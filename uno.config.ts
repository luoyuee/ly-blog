import presetWind4 from "@unocss/preset-wind4";
import { defineConfig } from "unocss";

export default defineConfig({
  presets: [
    presetWind4({
      preflights: {
        reset: true,
        theme: true
      }
    })
  ],
  theme: {
    colors: {
      theme: {
        "50": "#eef8ff",
        "100": "#d9eeff",
        "200": "#bce3ff",
        "300": "#8ed2ff",
        "400": "#59b7ff",
        "500": "#409eff",
        "600": "#1b78f5",
        "700": "#1461e1",
        "800": "#174eb6",
        "900": "#19448f",
        "950": "#142b57",
        DEFAULT: "#409eff"
      },
      page: { DEFAULT: "#fcfcfc" },
      box: { DEFAULT: "#ffffff" }
    },
    font: {
      sans: '"DingTalk JinBuTi", sans-serif',
      serif: '"DingTalk JinBuTi", sans-serif',
      mono: '"DingTalk JinBuTi", sans-serif',
      DEFAULT: '"DingTalk JinBuTi", sans-serif'
    }
  }
});
