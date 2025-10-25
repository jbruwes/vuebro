import type monacoNs from "monaco-editor-core";

import {
  configureMonacoTailwindcss,
  defaultLanguageSelector,
} from "monaco-tailwind";
// eslint-disable-next-line import-x/default
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import TailwindWorker from "monaco-tailwind/tailwind.worker?worker";
// eslint-disable-next-line import-x/default
import VueWorker from "@vuebro/monaco-sfc/vue.worker?worker";
import configureMonacoSFC from "@vuebro/monaco-sfc";
import { shikiToMonaco } from "@shikijs/monaco";
import { createHighlighter } from "shiki";
import * as monaco from "monaco-editor";

window.MonacoEnvironment = {
  getWorker: (workerId: string, label: string) => {
    switch (label) {
      case "tailwindcss":
        return new TailwindWorker();
      case "json":
        return new JsonWorker();
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
  await createHighlighter({
    langs: ["vue", "json", "jsx", "tsx"],
    themes: ["dark-plus", "light-plus"],
  }),
  monaco as typeof monacoNs,
);
