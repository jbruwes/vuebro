<template lang="pug">
q-drawer(
  v-model="rightDrawer",
  show-if-above,
  side="right",
  :width="drawerWidth"
)
  .column.fit
    q-tabs.text-grey(
      v-model="drawerTab",
      active-color="primary",
      align="justify",
      dense,
      indicator-color="primary",
      narrow-indicator
    )
      q-tab(label="seo", name="seo")
      q-tab(label="ai", name="ai")
    q-separator
    q-tab-panels.col.fit(v-model="drawerTab", keep-alive)
      q-tab-panel.column.no-padding(name="seo")
        q-list.fit(v-if="nodes && the")
          q-expansion-item(
            :label="t('Content Tree')",
            default-opened,
            header-class="text-primary",
            icon="account_tree"
          )
            v-interactive-tree
          q-separator
          q-card(flat)
            q-item.text-teal
              q-item-section(avatar)
                q-icon(name="description")
              q-item-section
                q-item-label {{ t("Page Settings") }}
            q-card-section
              q-list
                q-item(v-ripple, tag="label")
                  q-item-section(avatar)
                    q-checkbox(v-model="the.flat")
                  q-item-section
                    q-item-label flat
                    q-item-label(caption) flat
                q-select(
                  v-model.trim="the.class",
                  hide-dropdown-icon,
                  label="class",
                  multiple,
                  new-value-mode="add",
                  stack-label,
                  use-chips,
                  use-input
                )
          q-separator
          q-card(flat)
            q-item.text-teal
              q-item-section(avatar)
                q-icon(name="travel_explore")
              q-item-section
                q-item-label {{ t("SEO Settings") }}
            q-card-section
              q-select(
                v-model="the.type",
                :label="t('The type of media of your content')",
                :options="types",
                clearable,
                hint="type"
              )
              q-input(
                v-model.trim="the.header",
                :label="t('Page Header')",
                hint="header",
                clearable
              )
              q-input(
                v-model.trim="the.description",
                :label="t('Page Description')",
                autogrow,
                hint="description",
                type="textarea",
                clearable
              )
              q-select(
                v-model.trim="the.keywords",
                :label="t('Keywords')",
                hide-dropdown-icon,
                hint="keywords",
                multiple,
                new-value-mode="add",
                stack-label,
                use-chips,
                use-input
              )
              q-input(
                v-model.trim="loc",
                :rules,
                :label="t('Permanent Link')",
                hint="loc",
                prefix="/",
                type="url",
                clearable
              )
              q-select(
                v-model="the.changefreq",
                :label="t('Change Frequency')",
                :options="changefreq",
                clearable,
                hint="changefreq"
              )
              q-input(
                v-model.number="the.priority",
                :label="t('Priority')",
                hint="priority",
                max="1",
                min="0",
                step="0.1",
                type="number"
              )
              q-input(
                v-model="the.lastmod",
                :label="t('Last Modification')",
                clearable,
                hint="lastmod",
                type="datetime-local"
              )
              q-input(
                v-model.trim="the.icon",
                :label="t('Icon')",
                clearable,
                hint="icon"
              )
                template(#prepend)
                  Icon.q-icon.cursor-pointer(
                    :icon="the.icon || 'mdi:tray-arrow-up'"
                  )
                  q-popup-proxy.column.items-center.justify-center
                    q-input.q-ma-md(
                      v-model="filter",
                      :label="t('Search...')",
                      clearable,
                      dense
                    )
                    q-icon-picker(
                      v-model="icon",
                      v-model:model-pagination="pagination",
                      :filter,
                      :icons,
                      dense,
                      tooltips
                    )
      q-tab-panel.column.no-padding.justify-center(name="ai")
        .column.fit.no-wrap(v-if="apiKey && log", @vue:mounted="scrollToEnd")
          .scroll.q-pa-md.col.self-stretch
            q-chat-message(
              v-for="({ content, role }, i) in list",
              :key="i",
              ref="chatMessages",
              :sent="role === 'user'"
            )
              div(v-for="(msg, j) in content", :key="j")
                // eslint-disable-next-line vue/no-v-html
                .prose.text-xs.select-text(v-html="msg")
                q-btn(
                  flat,
                  round,
                  icon="content_copy",
                  size="xs",
                  @click="clipboard(msg)"
                )
                q-btn(
                  flat,
                  round,
                  icon="delete",
                  size="xs",
                  @click="content.length < 2 ? log.messages.splice(log.messages.length - i - 1, 1) : log.messages[log.messages.length - i - 1]?.content.splice(j, 1)"
                )
          q-input.q-ma-sm(
            v-model="message",
            :label="t('How can I help you today?')",
            autogrow,
            dense,
            autofocus,
            class="max-h-1/3",
            input-class="max-h-full",
            @keyup.ctrl.enter="send"
          )
            template(#prepend)
              q-icon.cursor-pointer(name="person")
                q-tooltip {{ t("Describe AI behavior") }}
                q-popup-edit(
                  v-slot="scope",
                  v-model="log.system",
                  buttons,
                  anchor="bottom end"
                )
                  q-input(
                    v-model="scope.value",
                    dense,
                    autofocus,
                    type="textarea",
                    :label="t('Describe AI behavior')"
                  )
            template(#after)
              q-btn(round, dense, flat, icon="send", @click="send")
        .self-center.text-center(v-else)
          q-btn(unelevated, color="primary", label="AI key", @click="clickAI")
          .q-mt-md {{ t("You need an AI key to use this feature") }}
  q-separator.bg-separator.absolute-left.-left-px.cursor-ew-resize(
    v-touch-pan.preserveCursor.prevent.mouse.horizontal="resizeDrawer",
    vertical,
    class="after:absolute after:top-1/2 after:-right-[5px] after:-left-[5px] after:h-[30px] after:-translate-y-1/2 after:rounded-[4px] after:bg-gray-400 after:pt-[3px] after:text-center after:content-['∷']"
  )
q-page.column.full-height(v-if="the")
  q-tabs.text-grey(
    v-model="tab",
    active-color="primary",
    align="justify",
    dense,
    indicator-color="primary",
    narrow-indicator
  )
    q-tab(label="wysiwyg", name="wysiwyg")
    q-tab(label="vue", name="vue")
    q-tab(label="json-ld", name="jsonld")
    q-tab(label="images", name="images")
  q-separator
  q-tab-panels.full-width.col(v-model="tab")
    q-tab-panel.column(name="wysiwyg")
      Suspense
        v-wysiwyg(:id="the.id", v-model="the.html")
        template(#fallback)
          q-inner-loading(showing)
            q-spinner-hourglass
    q-tab-panel(name="vue")
      Suspense
        v-source-code(ref="vueRef", :model="the.sfc", :api-key, :technologies)
          template(#fallback)
            q-inner-loading(showing)
              q-spinner-hourglass
    q-tab-panel(name="jsonld")
      Suspense
        v-source-code(
          ref="jsonldRef",
          :model="the.jsonld",
          :api-key,
          :technologies="['json-ld']"
        )
          template(#fallback)
            q-inner-loading(showing)
              q-spinner-hourglass
    q-tab-panel(name="images")
      v-images
q-page.column.full-height.bg-light(v-else)
  q-inner-loading(showing)
    q-spinner-hourglass
</template>
<script setup lang="ts">
import type { IconNameArray } from "@quasar/quasar-ui-qiconpicker";
import type { MistralProvider } from "@ai-sdk/mistral";
import type { ComponentPublicInstance } from "vue";
import type { RemovableRef } from "@vueuse/core";
import type { ValidationRule } from "quasar";
import type { TLog } from "@vuebro/shared";
import type { ModelMessage } from "ai";

import {
  mergeDefaults,
  itemsPerPage,
  persistent,
  immediate,
  cancel,
  deep,
  html,
  once,
  page,
} from "stores/defaults";
import {
  extractReasoningMiddleware,
  wrapLanguageModel,
  generateText,
} from "ai";
import mdi from "@quasar/quasar-ui-qiconpicker/src/components/icon-set/mdi-v6";
import { validateLog, importmap, nodes, pages } from "@vuebro/shared";
import { useTemplateRef, computed, nextTick, watch, ref } from "vue";
import VInteractiveTree from "components/VInteractiveTree.vue";
import VSourceCode from "src/components/VSourceCode.vue";
import { createMistral } from "@ai-sdk/mistral";
import changefreq from "assets/changefreq.json";
import VWysiwyg from "components/VWysiwyg.vue";
import { rightDrawer, the } from "stores/app";
import VImages from "components/VImages.vue";
import { useStorage } from "@vueuse/core";
import { createHighlighter } from "shiki";
import markedShiki from "marked-shiki";
import types from "assets/types.json";
import { Icon } from "@iconify/vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import dompurify from "dompurify";
import { marked } from "marked";

const clipboard = async (data: string) => {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": new Blob([data], { type: "text/plain" }),
        "text/html": new Blob([data], { type: "text/html" }),
      }),
    ]);
  },
  icon = computed({
    set(value: undefined | string) {
      if (value && the.value) the.value.icon = value.replace(/^mdi-/, "mdi:");
    },
    get() {
      return the.value?.icon?.replace(/^mdi:/, "mdi-");
    },
  }),
  loc = computed({
    set(value: string | null) {
      if (the.value)
        the.value.loc = value?.replace(/((?=(\/+))\2)$|(^\/+)/g, "") ?? null;
    },
    get() {
      return the.value?.loc ?? null;
    },
  }),
  markedWithShiki = marked.use(
    markedShiki({
      highlight: (code, lang) =>
        highlighter.codeToHtml(code, {
          theme: "light-plus",
          lang,
        }),
    }),
  ),
  scrollToEnd = () => {
    (
      chatMessages.value?.[chatMessages.value.length - 1]?.$el as
        | HTMLElement
        | undefined
    )?.scrollIntoView();
  },
  highlighter = await createHighlighter({
    langs: ["vue", "json", "jsx", "tsx", "html"],
    themes: ["dark-plus", "light-plus"],
  }),
  technologies = computed(() => [
    "tailwindcss",
    ...Object.keys(importmap.imports).filter((value) => value !== "vue"),
  ]),
  defaults = () => {
    const value = {} as TLog;
    validateLog?.(value) as boolean;
    return value;
  },
  jsonldRef = useTemplateRef<InstanceType<typeof VSourceCode>>("jsonldRef"),
  chatMessages = useTemplateRef<ComponentPublicInstance[]>("chatMessages"),
  vueRef = useTemplateRef<InstanceType<typeof VSourceCode>>("vueRef"),
  list = ref<{ content: string[]; role: string }[]>([]),
  { icons } = mdi as Record<"icons", IconNameArray>,
  pagination = ref({ itemsPerPage, page }),
  id = computed(() => nodes[0]?.id ?? ""),
  apiKey = useStorage("apiKey", ""),
  drawerTab = ref("seo"),
  tab = ref("wysiwyg"),
  message = ref(""),
  { t } = useI18n(),
  $q = useQuasar(),
  filter = ref(""),
  length = 20;

let mistral: MistralProvider | undefined,
  log: RemovableRef<TLog> | undefined,
  initialDrawerWidth = 300;

const initLog = () => {
    log = useStorage(id, defaults, localStorage, { mergeDefaults });
    watch(
      () => [...(log?.value.messages ?? [])],
      async (value, oldValue) => {
        list.value = await Promise.all(
          value
            .map(async ({ content, role }) => ({
              content: await Promise.all(
                content.map(async ({ text }) =>
                  dompurify.sanitize(await markedWithShiki.parse(text)),
                ),
              ),
              role,
            }))
            .toReversed(),
        );
        if (oldValue && value.length > oldValue.length) {
          await nextTick();
          scrollToEnd();
        }
      },
      { flush: "post", immediate, deep },
    );
  },
  clickAI = () => {
    $q.dialog({
      message: `${t("Get Mistral API Key")} at <a class="underline text-blue" href="https://console.mistral.ai/api-keys" target="_blank" rel="noreferrer">https://console.mistral.ai/api-keys</a>`,
      prompt: {
        hint: t("paste Mistral API Key only on a trusted computer"),
        model: apiKey.value,
        type: "password",
      },
      title: "Mistral API Key",
      persistent,
      cancel,
      html,
    }).onOk((data: string) => {
      apiKey.value = data;
    });
  },
  rules: ValidationRule[] = [
    (v) =>
      !v ||
      !pages.value.find(
        (element) =>
          element.path === v ||
          (element.id !== the.value?.id && element.loc === v),
      ) ||
      t("That name is already in use"),
    (v: string | null) =>
      !["?", "\\", "#"].some((value) => v?.includes(value)) ||
      t("Prohibited characters are used"),
  ],
  resizeDrawer = ({
    offset: { x },
    isFirst,
  }: {
    offset: { x: number };
    isFirst: boolean;
  }) => {
    if (isFirst) initialDrawerWidth = drawerWidth.value;
    const width = initialDrawerWidth - x;
    if (width > 300) drawerWidth.value = width;
  },
  drawerWidth = ref(initialDrawerWidth);

if (id.value) initLog();
else watch(id, initLog, { once });

watch(
  apiKey,
  (value) => {
    mistral = value ? createMistral({ apiKey: value }) : undefined;
  },
  { immediate },
);

const send = async () => {
  if (mistral && log && message.value) {
    const content = [{ text: message.value, type: "text" }],
      { messages, system } = log.value;
    if (tab.value === "vue" && vueRef.value) {
      const text = ((await vueRef.value.getSelection()) ?? "") as string;
      if (text)
        content.unshift({ text: `\`\`\`vue\n${text}\n\`\`\``, type: "text" });
    }
    if (tab.value === "jsonld" && jsonldRef.value) {
      const text = ((await jsonldRef.value.getSelection()) ?? "") as string;
      if (text)
        content.unshift({ text: `\`\`\`json\n${text}\n\`\`\``, type: "text" });
    }
    messages.unshift({ role: "user", content });
    message.value = "";
    if (messages.length > length) messages.length = length;
    try {
      const { text } = await generateText({
        model: wrapLanguageModel({
          middleware: extractReasoningMiddleware({ tagName: "think" }),
          model: mistral("magistral-medium-latest"),
        }),
        messages: messages.toReversed() as ModelMessage[],
        system,
      });
      messages.unshift({
        content: [{ type: "text", text }],
        role: "assistant",
      });
    } catch (err) {
      const { message } = err as Error;
      $q.notify({ message });
    }
  }
};
</script>

<style scoped>
:deep(pre) {
  white-space: break-spaces;
}
.q-textarea :deep(.q-field__control) {
  height: 100% !important;
}
</style>
