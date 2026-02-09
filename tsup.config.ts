import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  shims: true,
  // Align with renderer.ts looking for ../templates
  // We copy src/templates to a top-level templates folder
  // Align with renderer.ts looking for templates
  // We copy src/templates to dist/templates folder
  onSuccess: 'mkdir -p dist/templates && cp src/templates/*.mustache dist/templates/'
});
