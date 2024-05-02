import "@unocss/reset/tailwind.css";
import "daisyui/dist/full.css";
import "glightbox/dist/css/glightbox.css";
import "virtual:uno.css";
import "./style.sass";

import * as mdi from "@mdi/js";
import Tres from "@tresjs/core";
import { createHead } from "@unhead/vue";
import { Head } from "@unhead/vue/components";
import initUnocssRuntime from "@unocss/runtime";
import { MotionPlugin } from "@vueuse/motion";
import type { TData, TSettings } from "app/src/stores/data";
import { $, views } from "app/src/stores/data";
import {
  autoPrefix,
  bypassDefined,
  cache,
  once,
} from "app/src/stores/defaults";
import defaults from "app/uno.config";
import type { App } from "vue";
import { createApp, watch } from "vue";
import VueGtag from "vue-gtag";
import type {
  RouteComponent,
  Router,
  RouteRecordRaw,
  RouterHistory,
} from "vue-router";
import { createRouter, createWebHistory } from "vue-router";
import { initYandexMetrika } from "yandex-metrika-vue3";
import type { Config } from "yandex-metrika-vue3/src/types";

import vueApp from "@/App.vue";

import { fix } from "./stores/monolit";

window.console.info(
  "👨‍🚀",
  "The vues3 framework",
  `ver:${__APP_VERSION__}`,
  "https://vues3.ru",
);
initUnocssRuntime({ autoPrefix, defaults, bypassDefined });
/**
 * Приложение vue
 *
 * @type {App}
 */
const app: App = createApp(vueApp);
app.config.globalProperties.mdi = mdi;
void (async () => {
  /**
   * Ответ на считывание data.json
   *
   * @constant
   * @default
   * @type {Response}
   */
  const response: Response = await fetch("/data.json", {
    cache,
  });
  $.value = response.ok ? <TData>await response.json() : <TData>{};
  fix($.value.content);
})();
/**
 * Перевод яндекс метрики в продуктовый режим
 *
 * @constant
 * @default
 * @type {string}
 */
const env: string = process.env.NODE_ENV;
/**
 * Объект истории
 *
 * @type {RouterHistory}
 */
const history: RouterHistory = createWebHistory(import.meta.env.BASE_URL);
/**
 * Роуты
 *
 * @type {RouteRecordRaw[]}
 */
const routes: RouteRecordRaw[] = [];
/**
 * Роутер
 *
 * @type {Router}
 */
const router: Router = createRouter({ history, routes });
watch(
  views,
  (value) => {
    value.forEach(({ path, id: name, loc }) => {
      /**
       * Подготовленный алиас
       *
       * @constant
       * @default
       * @type {string}
       */
      const alias: string = `/${encodeURI(loc?.replace(" ", "_") ?? "")}`;
      router.addRoute({
        name,
        path: `/${path}`,
        ...(loc && { alias }),
        /**
         * Функция динамического импорта компонента
         *
         * @function component
         * @returns {RouteComponent} - Страница ошибки
         */
        component(): RouteComponent {
          return import(
            $.value?.settings?.landing
              ? "@/views/MultiView.vue"
              : "@/views/SingleView.vue"
          );
        },
      });
    });
    /**
     * Все неучтенные пути
     *
     * @constant
     * @default
     * @type {string}
     */
    const path: string = "/:catchAll(.*)*";
    router.addRoute({
      path,
      /**
       * Функция динамического импорта компонента
       *
       * @function component
       * @returns {RouteComponent} - Страница ошибки
       */
      component(): RouteComponent {
        return import("@/views/NotFoundView.vue");
      },
    });
    void router.replace(router.currentRoute.value.fullPath);
  },
  { once },
);
watch(
  () => <TSettings>$.value?.settings,
  ({ metrika, analytics }) => {
    if (metrika) {
      /**
       * Id метрики
       *
       * @constant
       * @default
       * @type {string}
       */
      const id: string = metrika;
      app.use(initYandexMetrika, <Config>{ id, router, env });
    }
    if (analytics) {
      /**
       * Id аналитики
       *
       * @constant
       * @default
       * @type {string}
       */
      const id: string = analytics;
      /**
       * Подготовленный конфиг
       *
       * @constant
       * @default
       * @type {{ id: string }}
       */
      const config: { id: string } = { id };
      app.use(VueGtag, { config }, router);
    }
  },
  { once },
);
app.use(router);
app.use(createHead());
app.use(Tres);
app.use(MotionPlugin);
app.component("VHead", Head);
app.mount("#app");
