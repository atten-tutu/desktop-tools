import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['api/index.ts'],
  format: 'cjs',
  outDir: "dist",
  dts: false,
  splitting: false,
  sourcemap: false,
  minify: true,
  clean: true,
  target: "node22",
  env: {
    NODE_ENV: "production",
  },
  noExternal: [/^(?!@types)/],
});
