import type { WorkerLanguageService } from "@volar/monaco/worker";
import type monacoNs from "monaco-editor-core";

import { shikiToMonaco } from "@shikijs/monaco";
import {
  activateAutoInsertion,
  activateMarkers,
  registerProviders,
} from "@volar/monaco";
import * as monaco from "monaco-editor";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
// eslint-disable-next-line import-x/default
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import { configureMonacoTailwindcss } from "monaco-tailwindcss";
import TailwindcssWorker from "monaco-tailwindcss/tailwindcss.worker?worker";
import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine-javascript.mjs";
import langJson from "shiki/langs/json.mjs";
import langVue from "shiki/langs/vue.mjs";
import themeDark from "shiki/themes/dark-plus.mjs";
import themeLight from "shiki/themes/light-plus.mjs";
// eslint-disable-next-line import-x/default
import VueWorker from "src/workers/vue.worker?worker";
import * as languageConfigs from "stores/language-configs";

window.MonacoEnvironment = {
  getWorker: (workerId: string, label: string) => {
    switch (label) {
      case "json":
        return new JsonWorker();
      case "tailwindcss":
        return new TailwindcssWorker();
      case "vue":
        return new VueWorker();
      default:
        return new EditorWorker();
    }
  },
};

const getSyncUris = () => monaco.editor.getModels().map(({ uri }) => uri),
  id = "vue",
  worker: monaco.editor.MonacoWebWorker<WorkerLanguageService> =
    monaco.editor.createWebWorker({
      label: id,
      moduleId: "vs/language/vue/vueWorker",
    });

monaco.languages.register({
  aliases: [id],
  extensions: [`.${id}`],
  id,
});

const languages = monaco.languages.getLanguages();

Object.entries(languageConfigs).forEach(
  ([alias, configuration]: [
    string,
    monaco.languages.LanguageConfiguration,
  ]) => {
    const { id } =
      languages.find(({ aliases }) => aliases?.includes(alias)) ?? {};
    if (id) monaco.languages.setLanguageConfiguration(id, configuration);
  },
);

void registerProviders(worker, [id], getSyncUris, monaco.languages);
activateMarkers(worker, [id], id, getSyncUris, monaco.editor);
activateAutoInsertion(worker, [id], getSyncUris, monaco.editor);
shikiToMonaco(
  createHighlighterCoreSync({
    engine: createJavaScriptRegexEngine(),
    langs: [langVue, langJson],
    themes: [themeDark, themeLight],
  }),
  monaco as typeof monacoNs,
);
configureMonacoTailwindcss(monaco, { languageSelector: id });
