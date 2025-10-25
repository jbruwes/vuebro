<!-- eslint-disable vue/no-v-html vue/no-v-text-v-html-on-component -->
<template lang="pug">
form.full-width.col.column(
  autocapitalize="on",
  autocomplete="on",
  autocorrect="on",
  spellcheck="true"
)
  q-editor.full-width.col.column(
    ref="editor",
    paragraph-tag="p",
    :definitions,
    :dense="$q.screen.lt.md",
    :fonts,
    :model-value="htm",
    :placeholder,
    :toolbar,
    content-class="col prose max-w-none",
    flat,
    @drop="paste",
    @paste="paste",
    @update:model-value="$emit('update:modelValue', $event)"
  )
  q-tooltip.text-caption.bg-primary(
    v-if="blocks && inViewport",
    v-model="show",
    :target,
    anchor="top left",
    self="top left",
    :scroll-target,
    v-html="tagNameClassList"
  )
  q-menu(
    v-if="blocks",
    touch-position,
    context-menu,
    :target="scrollTarget",
    :scroll-target,
    @show="srcElement = target"
  )
    q-list(dense)
      q-item(
        v-close-popup,
        clickable,
        :disable="!srcElement",
        @click="openClassDialog"
      )
        q-item-section(side)
          q-icon(name="css")
        q-item-section {{ t("Edit classes") }}
</template>
<script setup lang="ts">
import type {
  QuasarLanguageEditorLabel,
  QuasarIconSetEditor,
  StringDictionary,
  QEditorCommand,
  QEditor,
} from "quasar";

import {
  bypassDefined,
  persistent,
  immediate,
  accept,
  reset,
} from "stores/defaults";
import { onUnmounted, onMounted, computed, nextTick, watch, ref } from "vue";
import { getFontsObjectFromArray, fonts as Fonts } from "@vuebro/shared";
import VChipsInputDialog from "components/dialogs/VChipsInputDialog.vue";
import VLinkDialog from "components/dialogs/VLinkDialog.vue";
import presets from "@vuebro/configs/uno/presets";
import initUnocssRuntime from "@unocss/runtime";
import { useFileDialog } from "@vueuse/core";
import { consola } from "consola/browser";
import { parse } from "path-browserify";
import mimes from "assets/mimes.json";
import { putObject } from "stores/io";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { urls } from "stores/app";

let rootElement: () => undefined | Element;

const { files, open } = useFileDialog({ accept, reset }),
  { t } = useI18n();
const toolbar = computed(() => [
    ["left", "center", "right", "justify"],
    ["bold", "italic", "strike", "underline", "subscript", "superscript"],
    ["hr", "link"],
    ["print", "fullscreen", "dashboard"],
    [
      ...[
        [
          "formatting",
          [
            "p",
            ...[...Array(6).keys()].map((key) => `h${String(key + 1)}`),
            "code",
          ],
          false,
          false,
        ],
        [
          "fontSize",
          [...Array(7).keys()].map((key) => `size-${String(key + 1)}`),
          true,
          true,
        ],
        [
          "defaultFont",
          [
            "default_font",
            ...Object.keys(fonts.value).sort((a, b) => a.localeCompare(b)),
          ],
          false,
          true,
        ],
      ].map(([key, options, fixedLabel, fixedIcon]) => ({
        label:
          $q.lang.editor[
            key as keyof StringDictionary<QuasarLanguageEditorLabel>
          ],
        icon: $q.iconSet.editor[
          key as keyof StringDictionary<QuasarIconSetEditor>
        ],
        fixedLabel,
        fixedIcon,
        options,
        list,
      })),
      "removeFormat",
    ],
    ["quote", "unordered", "ordered", "outdent", "indent"],
    ["undo", "redo"],
    ["wallpaper", "file_present"],
  ]),
  fonts = computed(() => ({
    ...getFontsObjectFromArray([
      "Arial",
      "Arial Black",
      "Comic Sans",
      "Courier New",
      "Impact",
      "Lucida Grande",
      "Times New Roman",
      "Verdana",
    ]),
    ...getFontsObjectFromArray(Fonts),
  })),
  props = withDefaults(
    defineProps<{
      modelValue?: Promise<string> | string;
      id?: undefined | string;
    }>(),
    {
      modelValue: "",
      id: "",
    },
  ),
  placeholder = t("Add some content to your page..."),
  srcElement = ref<boolean | Element>(true),
  target = ref<boolean | Element>(false),
  htm = ref(await props.modelValue),
  scrollTarget = ref<Element>(),
  tagNameClassList = ref(""),
  editor = ref<QEditor>(),
  inViewport = ref(false),
  blocks = ref(false),
  list = "no-icons",
  show = ref(false),
  $q = useQuasar();

const definitions = {
  ...Object.fromEntries(
    [
      [
        "dashboard",
        t("Show Blocks"),
        () => {
          blocks.value = !blocks.value;
          if (blocks.value) scrollTarget.value?.classList.add("outline");
          else scrollTarget.value?.classList.remove("outline");
        },
      ],
      ["wallpaper", t("Upload Image"), open],
      [
        "file_present",
        t("Insert Route"),
        () => {
          $q.dialog({
            componentProps: {
              message: t("Select a page to insert the corresponding link"),
              title: t("Internal Links"),
              persistent,
            },
            component: VLinkDialog,
          }).onOk((value: string) => {
            editor.value?.runCmd("createLink", value);
          });
        },
      ],
    ].map(
      ([icon, tip, handler]) =>
        [icon, { handler, icon, tip }] as [string, QEditorCommand],
    ),
  ),
  ...Object.fromEntries(
    [
      ...[...Array(6).keys()].map((key) => [
        `h${String(key + 1)}`,
        `heading${String(key + 1)}`,
      ]),
      ["p", "paragraph"],
      ["code", "code"],
    ].map(([key = "div", value]) => [
      key,
      {
        htmlTip: `<span class="prose">
  <${key} class="!my-0">${$q.lang.editor[value as keyof StringDictionary<QuasarLanguageEditorLabel>]}</${key}>
</span>`,
      },
    ]),
  ),
};

const insertImage = (file: File) => {
    const message = t(
        "The graphic file type is not suitable for use on the web",
      ),
      { name, type } = file;
    if (mimes.includes(type)) {
      const fileName = parse(name),
        filePath = `images/${fileName.name}.${Math.random().toString(36).slice(2)}${fileName.ext}`;
      (async () => {
        await putObject(
          filePath,
          new Uint8Array(await file.arrayBuffer()),
          type,
        );
      })().catch(consola.error);
      urls.set(filePath, URL.createObjectURL(file));
      editor.value?.runCmd(
        "insertHTML",
        `<img src="${urls.get(filePath) ?? ""}" data-src="${filePath}" alt="" decoding="async" loading="lazy" />`,
      );
    } else $q.notify({ message });
  },
  openClassDialog = () => {
    if (typeof srcElement.value !== "boolean") {
      const { classList = [] } = srcElement.value;
      $q.dialog({
        componentProps: {
          message: t(
            "The class global attribute is a list of the classes of the element, separated by whitespace",
          ),
          value: [...classList],
          title: "class",
          persistent,
        },
        component: VChipsInputDialog,
      }).onOk((className: string[]) => {
        if (typeof srcElement.value !== "boolean")
          srcElement.value.className = className.join(" ");
        emit("update:modelValue", scrollTarget.value?.innerHTML);
      });
    }
  },
  onMouseover = ({ target: element, currentTarget }: Event) => {
    if (
      blocks.value &&
      element !== currentTarget &&
      element instanceof Element
    ) {
      const { x = 0, y = 0 } =
        scrollTarget.value?.getBoundingClientRect() ?? {};
      const { left, top } = element.getBoundingClientRect();
      inViewport.value = left > x && top > y;
      const { classList, tagName } = element;
      tagNameClassList.value = [
        `<strong>${tagName.toLowerCase()}</strong>`,
        ...classList,
      ].join(".");
      target.value = element;
    } else target.value = false;
  },
  paste = (evt: ClipboardEvent | DragEvent) => {
    const { files = [] } =
      (evt as DragEvent).dataTransfer ??
      (evt as ClipboardEvent).clipboardData ??
      {};
    if (files.length) {
      evt.preventDefault();
      evt.stopPropagation();
      [...files].forEach(insertImage);
    }
  },
  onContextmenu = (event: Event) => {
    event.stopPropagation();
  },
  emit = defineEmits(["update:modelValue"]);

watch(files, (newFiles) => {
  if (newFiles) [...newFiles].forEach(insertImage);
});

watch(target, async () => {
  show.value = false;
  await nextTick();
  show.value = true;
});

watch(
  () => props.id,
  async () => {
    htm.value = await props.modelValue;
    if (scrollTarget.value && scrollTarget.value.innerHTML !== htm.value)
      scrollTarget.value.innerHTML = htm.value;
  },
);

onMounted(() => {
  rootElement = editor.value?.getContentEl ?? (() => undefined);
  watch(
    Fonts,
    async (value) => {
      await initUnocssRuntime({
        defaults: {
          presets: presets({
            webFontsOptions: { fonts: getFontsObjectFromArray(value) },
          }),
        },
        bypassDefined,
        rootElement,
      });
    },
    { immediate },
  );
  scrollTarget.value = rootElement();
  scrollTarget.value?.addEventListener("mouseover", onMouseover);
  scrollTarget.value?.addEventListener("contextmenu", onContextmenu);
  editor.value?.focus();
});

onUnmounted(() => {
  scrollTarget.value?.removeEventListener("mouseover", onMouseover);
  scrollTarget.value?.removeEventListener("contextmenu", onContextmenu);
});
</script>
<style scoped>
:deep(.outline *) {
  outline-style: dashed;
  outline-width: 2px;
  outline-offset: 2px;
  outline-color: rgb(25, 118, 210);
}
</style>
