<template lang="pug">
.size-full(ref="monacoRef")
</template>

<script setup lang="ts">
import type { CompletionRegistration } from "monacopilot";
import type { ThemeRegistrationRaw } from "shiki";

import { onBeforeUnmount, useTemplateRef, onMounted, watch } from "vue";
import { registerCompletion, CompletionCopilot } from "monacopilot";
import themeLight from "shiki/themes/light-plus.mjs";
import { immediate } from "stores/defaults";
import * as monaco from "monaco-editor";

let editor: monaco.editor.IStandaloneCodeEditor | null = null,
  completion: CompletionRegistration | null = null;

const { technologies, apiKey, model } = defineProps<{
    model: Promise<monaco.editor.ITextModel>;
    technologies: string[];
    apiKey: string;
  }>(),
  { name: theme = "light-plus" }: ThemeRegistrationRaw = themeLight,
  monacoRef = useTemplateRef<HTMLElement>("monacoRef"),
  ambiguousCharacters = false,
  unicodeHighlight = { ambiguousCharacters },
  scrollBeyondLastLine = false,
  fixedOverflowWidgets = true,
  automaticLayout = true;

watch(
  () => model,
  async () => {
    editor?.setModel(await model);
  },
);

onMounted(async () => {
  editor =
    monacoRef.value &&
    monaco.editor.create(monacoRef.value, {
      fixedOverflowWidgets,
      scrollBeyondLastLine,
      model: await model,
      unicodeHighlight,
      automaticLayout,
      theme,
    });
  watch(
    [() => apiKey, () => technologies],
    async () => {
      completion?.deregister();
      completion = null;
      if (apiKey && editor) {
        const copilot = new CompletionCopilot(apiKey, {
            provider: "mistral",
            model: "codestral",
          }),
          {
            uri: { path },
          } = await model;
        completion = registerCompletion(monaco, editor, {
          onError: () => {
            // console.error(error);
          },
          requestHandler: ({ body }) => copilot.complete({ body }),
          language: (await model).getLanguageId(),
          filename: path,
          technologies,
        });
      }
    },
    { immediate },
  );
  if (editor) {
    editor.focus();
    const { _themeService: themeService } = editor as unknown as Record<
      string,
      Record<string, Record<string, ((...args: never) => unknown) | boolean>>
    >;
    if (themeService) {
      const { _theme: t } = themeService;
      if (t) {
        t.semanticHighlighting = true;
        t.getTokenStyleMetadata = (type: string, modifiers: string[]) => {
          let foreground = 0;
          switch (type) {
            case "function":
            case "method":
              foreground = 12;
              break;
            case "property":
            case "variable":
              foreground = modifiers.includes("readonly") ? 19 : 9;
              break;
            case "class":
              foreground = 11;
              break;
            default:
          }
          return { foreground };
        };
      }
    }
  }
});

onBeforeUnmount(() => {
  completion?.deregister();
  completion = null;
  editor?.dispose();
  editor = null;
});

defineExpose({
  getSelection: async () => {
    const selection = editor?.getSelection() ?? null;
    const value =
      selection && !selection.isEmpty()
        ? (await model).getValueInRange(selection)
        : null;
    editor?.trigger("editor", "cancelSelection", {});
    return value;
  },
});
</script>
