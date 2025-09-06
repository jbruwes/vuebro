import type {
  // Language,
  LanguageServicePlugin,
  WorkerLanguageService,
} from "@volar/monaco/worker";
import type { VueCompilerOptions } from "@vue/language-core";
// import type { LanguageService } from "@vue/language-service";
import type { worker } from "monaco-editor";

import { Window } from "@remote-dom/polyfill";
import { createNpmFileSystem } from "@volar/jsdelivr";
import { createTypeScriptWorkerLanguageService } from "@volar/monaco/worker";
import {
  createVueLanguagePlugin,
  getDefaultCompilerOptions,
  // VueVirtualCode,
} from "@vue/language-core";
import { getFullLanguageServicePlugins } from "@vue/language-service";
// import { createVueLanguageServiceProxy } from "@vue/typescript-plugin/lib/common";
// import { getComponentDirectives } from "@vue/typescript-plugin/lib/requests/getComponentDirectives";
// import { getComponentEvents } from "@vue/typescript-plugin/lib/requests/getComponentEvents";
// import { getComponentNames } from "@vue/typescript-plugin/lib/requests/getComponentNames";
// import { getComponentProps } from "@vue/typescript-plugin/lib/requests/getComponentProps";
// import { getComponentSlots } from "@vue/typescript-plugin/lib/requests/getComponentSlots";
// import { getElementAttrs } from "@vue/typescript-plugin/lib/requests/getElementAttrs";
// import { getElementNames } from "@vue/typescript-plugin/lib/requests/getElementNames";
// import { getPropertiesAtLocation } from "@vue/typescript-plugin/lib/requests/getPropertiesAtLocation";
import { initialize } from "monaco-editor/esm/vs/editor/editor.worker";
import typescript, { convertCompilerOptionsFromJson } from "typescript";
// import { create as createTypeScriptDirectiveCommentPlugin } from "volar-service-typescript/lib/plugins/directiveComment";
// import { create as createTypeScriptSemanticPlugin } from "volar-service-typescript/lib/plugins/semantic";
import { URI } from "vscode-uri";

declare module "@volar/language-service" {
  interface ProjectContext {
    vue?: {
      compilerOptions: VueCompilerOptions;
    };
  }
}

/** Don't remove! It's prevent emoji errors. (Non-UTF characters in the code) */
Window.setGlobal(new Window());

const asFileName = ({ path }: { path: URI["path"] }) => path,
  asUri = (fileName: string) => URI.file(fileName),
  vueCompilerOptions = getDefaultCompilerOptions(),
  { options: compilerOptions } = convertCompilerOptionsFromJson(
    {
      allowImportingTsExtensions: true,
      allowJs: true,
      checkJs: true,
      jsx: "Preserve",
      module: "ESNext",
      moduleResolution: "Bundler",
      target: "ESNext",
    },
    "",
  );

self.onmessage = () => {
  (
    initialize as (
      foreignModule: (
        workerContext: worker.IWorkerContext,
      ) => WorkerLanguageService,
    ) => void
  )((workerContext) => {
    // const getProgram = () =>
    //     (
    //       getLanguageService().context.inject(
    //         "typescript/languageService",
    //       ) as typescript.LanguageService
    //     ).getProgram(),
    //   getVirtualCode = (fileName: string) => {
    //     const sourceScript = getLanguageService().context.language.scripts.get(
    //       asUri(fileName),
    //     );
    //     if (!sourceScript)
    //       throw new Error("No source script found for file: " + fileName);
    //     const virtualCode = sourceScript.generated?.root;
    //     if (!(virtualCode instanceof VueVirtualCode))
    //       throw new Error("No virtual code found for file: " + fileName);
    //     return {
    //       sourceScript,
    //       virtualCode,
    //     };
    //   };
    const workerService = createTypeScriptWorkerLanguageService({
      compilerOptions,
      env: { fs: createNpmFileSystem(), workspaceFolders: [URI.file("/")] },
      languagePlugins: [
        createVueLanguagePlugin(
          typescript,
          compilerOptions,
          vueCompilerOptions,
          asFileName,
        ),
      ],
      languageServicePlugins: getFullLanguageServicePlugins(
        typescript,
      ) as unknown as LanguageServicePlugin[],
      // setup: ({ project }) => {
      //   project.vue = { compilerOptions: vueCompilerOptions };
      // },
      typescript,
      uriConverter: { asFileName, asUri },
      workerContext,
    });

    return workerService;

    // function getLanguageService() {
    //   //@ts-expect-error Property 'languageService' is private and only accessible within class 'WorkerLanguageService'.
    //   return workerService.languageService as LanguageService;
    // }
  });
};
