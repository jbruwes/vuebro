import { viteStaticCopy } from "vite-plugin-static-copy";
import { defineConfig } from "#q-app/wrappers";
import { fileURLToPath } from "url";
import { mergeConfig } from "vite";

export default defineConfig(() => ({
  build: {
    vitePlugins: [
      [
        "@intlify/unplugin-vue-i18n/vite",
        { include: [fileURLToPath(new URL("./src/i18n", import.meta.url))] },
      ],
      [
        "vite-plugin-checker",
        {
          eslint: {
            lintCommand:
              'eslint -c ./eslint.config.ts "./src*/**/*.{ts,js,mjs,cjs,vue}"',
            useFlatConfig: true,
          },
          vueTsc: true,
        },
        { server: false },
      ],
      ["@unocss/vite"],
      [
        // @ts-expect-error Plugin<any>[]
        viteStaticCopy,
        {
          targets: [
            { src: "./node_modules/@vuebro/runtime/dist/*", dest: "runtime" },
          ],
        },
      ],
    ],
    extendViteConf: (config) => {
      config.base = "./";
      config.define = mergeConfig(
        config.define ?? {},
        {
          __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
        },
        false,
      );
    },
    target: { browser: ["es2022", "firefox115", "chrome115", "safari15"] },
    typescript: { vueShim: true, strict: true },
    alias: { "node:path": "path-browserify" },
  },
  electron: {
    builder: {
      snap: {
        publish: [{ provider: "snapStore", channels: ["stable"] }],
      },
      publish: [{ releaseType: "release", provider: "github" }],
      appId: "vuebro",
    },
    preloadScripts: ["electron-preload"],
    bundler: "builder",
  },
  boot: ["main", "route", "quasar-lang-pack", "i18n", "monaco"],
  extras: ["mdi-v7", "roboto-font", "material-icons"],
  framework: { plugins: ["Dialog", "Notify"] },
  animations: ["zoomIn", "zoomOut"],
  css: ["app.css"],
}));
