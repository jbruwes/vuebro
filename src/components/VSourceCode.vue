<template lang="pug">
.size-full(ref="monacoRef")
</template>

<script setup lang="ts">
import type { CompletionRegistration } from "monacopilot";
import type { ThemeRegistrationRaw } from "shiki";

import { useStorage } from "@vueuse/core";
import * as monaco from "monaco-editor";
import { CompletionCopilot, registerCompletion } from "monacopilot";
import themeLight from "shiki/themes/light-plus.mjs";
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from "vue";

let completionRegistration: CompletionRegistration | null,
  editor: monaco.editor.IStandaloneCodeEditor | null;

const { name: theme = "light-plus" }: ThemeRegistrationRaw = themeLight;

const ambiguousCharacters = false,
  apiKey = useStorage("AI", ""),
  automaticLayout = true,
  fixedOverflowWidgets = true,
  props = defineProps<{
    id?: string | undefined;
    model: Promise<monaco.editor.ITextModel>;
  }>(),
  model = await props.model,
  monacoRef = useTemplateRef("monacoRef"),
  scrollBeyondLastLine = false,
  unicodeHighlight = { ambiguousCharacters };

watch(
  () => props.model,
  async (value) => {
    editor?.setModel(await value);
  },
);

onMounted(() => {
  editor =
    monacoRef.value &&
    monaco.editor.create(monacoRef.value, {
      automaticLayout,
      fixedOverflowWidgets,
      model,
      scrollBeyondLastLine,
      theme,
      unicodeHighlight,
    });
  watch(
    apiKey,
    (key) => {
      if (completionRegistration) {
        completionRegistration.deregister();
        completionRegistration = null;
      }
      if (key && editor) {
        const copilot = new CompletionCopilot(key, {
          model: "codestral",
          provider: "mistral",
        });
        completionRegistration = registerCompletion(monaco, editor, {
          filename: `${props.id ?? ""}.vue`,
          language: "vue",
          requestHandler: ({ body }) => copilot.complete({ body }),
          technologies: ["tailwindcss"],
        });
      }
    },
    { immediate: true },
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
            case "class":
              foreground = 11;
              break;
            case "function":
            case "method":
              foreground = 12;
              break;
            case "property":
            case "variable":
              foreground = modifiers.includes("readonly") ? 19 : 9;
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
  if (completionRegistration) {
    completionRegistration.deregister();
    completionRegistration = null;
  }
  editor?.dispose();
});
</script>
