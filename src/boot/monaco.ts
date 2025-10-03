import type monacoNs from "monaco-editor-core";

import { shikiToMonaco } from "@shikijs/monaco";
import { configureMonacoSFC } from "@vuebro/monaco-sfc";
// eslint-disable-next-line import-x/default
import VueWorker from "@vuebro/monaco-sfc/vue.worker?worker";
import * as monaco from "monaco-editor";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
// eslint-disable-next-line import-x/default
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import {
  configureMonacoTailwindcss,
  defaultLanguageSelector,
} from "monaco-tailwind";
import TailwindWorker from "monaco-tailwind/tailwind.worker?worker";
import { createHighlighterCoreSync } from "shiki/core";
import langJson from "shiki/langs/json.mjs";
import langJsx from "shiki/langs/jsx.mjs";
import langTsx from "shiki/langs/tsx.mjs";
import langVue from "shiki/langs/vue.mjs";
import themeDark from "shiki/themes/dark-plus.mjs";
import themeLight from "shiki/themes/light-plus.mjs";
import { engine } from "src/stores/app";

window.MonacoEnvironment = {
  getWorker: (workerId: string, label: string) => {
    switch (label) {
      case "json":
        return new JsonWorker();
      case "tailwindcss":
        return new TailwindWorker();
      case "vue":
        return new VueWorker();
      default:
        return new EditorWorker();
    }
  },
};

configureMonacoSFC(monaco as typeof monacoNs);
configureMonacoTailwindcss(monaco, {
  languageSelector: [...defaultLanguageSelector, "vue"],
});

shikiToMonaco(
  createHighlighterCoreSync({
    engine,
    langs: [langVue, langJson, langJsx, langTsx],
    themes: [themeDark, themeLight],
  }),
  monaco as typeof monacoNs,
);
