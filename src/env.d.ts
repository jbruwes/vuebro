declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_BASE: string | undefined;
    VUE_ROUTER_MODE: "abstract" | "hash" | "history" | undefined;
    // Define any custom env variables you have here, if you wish
  }
}
declare const __APP_VERSION__: string;
declare module "@quasar/quasar-ui-qiconpicker/src/components/icon-set/mdi-v6";
declare module "vue-sfc-descriptor-to-string";
declare module "jsonfeed-to-atom";
declare module "jsonfeed-to-rss";
declare module "eslint-plugin-vue-pug" {
  export const configs: Record<string, unknown>;
}
