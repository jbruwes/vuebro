<template lang="pug">
q-dialog(ref="dialogRef", full-width, full-height, @hide="onDialogHide")
  q-card.q-dialog-plugin.column
    q-card-section.q-dialog__title {{ t("News") }}
    q-card-section.q-dialog__message JSON Feed: feed.json, ATOM: feed.xml, RSS: feed-rss.xml
    q-card-section.q-dialog-plugin__form.col.q-px-md(horizontal)
      q-form.w-full(ref="form")
        q-table.h-full.w-full(
          v-model:selected="selected",
          :rows,
          row-key="id",
          selection="single",
          :filter,
          grid,
          card-container-class="scroll",
          :rows-per-page-options="[4, 8, 12, 16, 20, 24, 28, 0]"
        )
          template(#top-left)
            q-btn-group(outline)
              q-btn(
                color="primary",
                icon="add",
                outline,
                @click="rows.unshift({ attachments: [{ mime_type: '', url: '' }], content_html: '', date_published: new Date().toISOString(), id: uid(), title: '', url: '' })"
              )
              q-btn(
                color="primary",
                icon="remove",
                outline,
                @click="removeRow"
              )
          template(#top-right)
            q-input(
              v-model="filter",
              borderless,
              debounce="300",
              placeholder="Search"
            )
              template(#append)
                q-icon(name="search")
          template(#item="props")
            .q-table__grid-item.col-xs-12.col-sm-6.col-md-4.col-lg-3(
              :class="{ 'q-table__grid-item--selected': props.selected }"
            )
              .q-table__grid-item-card.q-table__card.q-table--flat.q-table--bordered
                .q-table__grid-item-row
                  q-input(
                    v-model="props.row.title",
                    label="Title",
                    lazy-rules,
                    :rules="[(val) => !!val || t('Item is required')]"
                  )
                    template(#prepend)
                      q-checkbox(v-model="props.selected")
                .q-table__grid-item-row
                  q-input(
                    v-model="props.row.attachments[0].url",
                    filled,
                    label="Image",
                    type="url"
                  )
                    template(#append)
                      q-icon.cursor-pointer(
                        v-if="domain",
                        name="image",
                        @click="add(props.row)"
                      )
                .q-table__grid-item-row
                  q-input(
                    v-model="props.row.url",
                    filled,
                    label="Url",
                    type="url"
                  )
                    template(#append)
                      q-icon.cursor-pointer(
                        v-if="domain",
                        name="link",
                        @click="clickLink(props.row)"
                      )
                .q-table__grid-item-row
                  q-editor(
                    v-model="props.row.content_html",
                    placeholder="Content Html"
                  )
    q-card-actions(align="right")
      q-btn(
        color="primary",
        :label="t('Cancel')",
        flat,
        @click="onDialogCancel"
      )
      q-btn(color="primary", label="Ok", flat, @click="clickOk")
</template>

<script setup lang="ts">
import type { TFeed } from "@vuebro/shared";
import type { QForm } from "quasar";

import { consoleError } from "@vuebro/shared";
import { useFileDialog } from "@vueuse/core";
import mimes from "assets/mimes.json";
import VLinkDialog from "components/dialogs/VLinkDialog.vue";
import { parse } from "path-browserify";
import { uid, useDialogPluginComponent, useQuasar } from "quasar";
import { domain } from "stores/app";
import { accept, capture, multiple, persistent, reset } from "stores/defaults";
import { putObject } from "stores/io";
import { ref, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";

let row: TFeed["items"][0] | undefined;

const { dialogRef, onDialogCancel, onDialogHide, onDialogOK } =
    useDialogPluginComponent(),
  { feed } = defineProps<{ feed: TFeed }>(),
  { items } = feed,
  { onChange, open } = useFileDialog({
    accept,
    capture,
    multiple,
    reset,
  }),
  { t } = useI18n();

const $q = useQuasar(),
  filter = ref(""),
  formRef = useTemplateRef<QForm>("form"),
  rows = ref(
    items
      .map((item) => {
        item.url ||= "";
        if (!item.attachments.length)
          item.attachments.push({
            mime_type: "",
            url: "",
          });
        return item;
      })
      .reverse(),
  ),
  selected = ref<TFeed["items"]>([]);

const add = (value: TFeed["items"][0]) => {
    row = value;
    open();
  },
  clickLink = (feed: TFeed["items"][0]) => {
    $q.dialog({
      component: VLinkDialog,
      componentProps: {
        message: t("Select a page to insert the corresponding link"),
        persistent,
        title: t("Internal Links"),
      },
    }).onOk((value: string) => {
      feed.url = `https://${domain.value}${value}`;
    });
  },
  clickOk = async () => {
    if (await formRef.value?.validate()) onDialogOK(rows.value);
    else
      $q.notify({
        message: t("Title must be not empty"),
      });
  },
  removeRow = () => {
    if (selected.value.length)
      $q.dialog({
        cancel: true,
        message: t("Do you really want to delete?"),
        persistent: true,
        title: t("Confirm"),
      }).onOk(() => {
        const set = new Set(selected.value);
        rows.value = rows.value.filter((x) => !set.has(x));
        selected.value = [];
      });
  };

onChange((files) => {
  if (files) {
    const [file] = files;
    if (file && row) {
      const { name, type } = file;
      if (mimes.includes(type)) {
        const fileName = parse(name),
          filePath = `images/${fileName.name}.${Math.random().toString(36).slice(2)}${fileName.ext}`;
        (async () => {
          await putObject(
            filePath,
            new Uint8Array(await file.arrayBuffer()),
            type,
          );
        })().catch(consoleError);
        if (row.attachments[0])
          row.attachments[0].url = `https://${domain.value}/${filePath}`;
      } else
        $q.notify({
          message: t(
            "The graphic file type is not suitable for use on the web",
          ),
        });
    }
  }
});

defineEmits([...useDialogPluginComponent.emits]);
</script>
