import { config as baseConfig } from "./packages/eslint-config/base.js";

export default [
  ...baseConfig,
  {
    ignores: [
      "packages/**",
      "frontend/**",
      "server/**",
    ],
  },
];
