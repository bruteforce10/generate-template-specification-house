import { Config } from "@remotion/bundler";

export default {
  composition: "PropertyVideo",
  entryPoint: "./src/main.jsx",
  webpackOverride: (config: any) => config,
} satisfies Config;
