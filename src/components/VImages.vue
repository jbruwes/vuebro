<template lang="pug">
.row.q-col-gutter-xs
  .col-xs-12.col-sm-6.col-md-4.col-lg-3.col-xl-2(
    v-for="(image, i) in images",
    :key="i"
  )
    q-card(bordered, flat)
      q-card-section(horizontal)
        q-img.col(
          :ratio="16 / 9",
          :src="urls.get(image.url ?? '')",
          fit="cover"
        )
          .absolute-bottom
            q-input(v-model="image.alt", dark, dense)
        q-card-actions.q-px-md.justify-around(vertical)
          q-btn(
            flat,
            icon="content_paste",
            round,
            :disable="!image.url",
            @click="copy(i)"
          )
            q-tooltip.bg-primary(
              v-if="image.url",
              anchor="center left",
              self="center right"
            ) {{ t("Copy Link") }}
          q-btn(flat, icon="add", round, @click="add(i)")
            q-tooltip.bg-primary(anchor="center left", self="center right") {{ t("Add Image") }}
          q-btn(flat, icon="remove", round, @click="remove(i)")
            q-tooltip.bg-primary(anchor="center left", self="center right") {{ t("Remove Image") }}
          q-btn(flat, icon="arrow_left", round, @click="left(i)")
            q-tooltip.bg-primary(anchor="center left", self="center right") {{ t("Image Left") }}
          q-btn(flat, icon="arrow_right", round, @click="right(i)")
            q-tooltip.bg-primary(anchor="center left", self="center right") {{ t("Image Right") }}
          q-btn(flat, icon="upload", round, @click="upload(i)")
            q-tooltip.bg-primary(anchor="center left", self="center right") {{ t("Upload Image") }}
</template>

<script setup lang="ts">
import type { TPage } from "@vuebro/shared";

import {
  persistent,
  immediate,
  multiple,
  capture,
  accept,
  reset,
} from "stores/defaults";
import { getObjectBlob, putObject } from "stores/io";
import { useFileDialog } from "@vueuse/core";
import { consola } from "consola/browser";
import { parse } from "path-browserify";
import { urls, the } from "stores/app";
import mimes from "assets/mimes.json";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { watch, ref } from "vue";

let index = 0;

const { onChange, open } = useFileDialog({
    multiple,
    capture,
    accept,
    reset,
  }),
  { t } = useI18n();

const images = ref([] as TPage["images"]),
  $q = useQuasar();

const remove = (i: number) => {
    $q.dialog({
      message: t("Do you really want to delete?"),
      title: t("Confirm"),
      cancel: true,
      persistent,
    }).onOk(() => {
      images.value.splice(i, 1);
    });
  },
  right = (i: number) => {
    if (i < images.value.length - 1) {
      const next = images.value[i + 1];
      if (images.value[i] && next)
        [images.value[i], images.value[i + 1]] = [next, images.value[i]];
    }
  },
  copy = async (i: number) => {
    if (images.value[i]?.url) {
      await navigator.clipboard.writeText(images.value[i].url);
      $q.notify({ message: t("The link has been copied to clipboard") });
    }
  },
  left = (i: number) => {
    if (i) {
      const prev = images.value[i - 1];
      if (images.value[i] && prev)
        [images.value[i - 1], images.value[i]] = [images.value[i], prev];
    }
  },
  add = (i: number) => {
    const alt = "",
      url = "";
    images.value.splice(i + 1, 0, { alt, url });
  },
  upload = (i: number) => {
    index = i;
    open();
  };

watch(
  images,
  (value) => {
    if (!value.length) add(-1);
    if (the.value) {
      the.value.images = value
        .filter(({ url }) => url)
        .map(({ alt = "", url = "" }) => ({ alt, url }));
      the.value.images
        .filter(({ url = "" }) => !urls.has(url))
        .forEach(({ url = "" }) => {
          (async () => {
            urls.set(url, URL.createObjectURL(await getObjectBlob(url)));
          })().catch(consola.error);
        });
    }
  },
  { deep: true },
);

watch(
  the,
  (value) => {
    if (!value?.images.length) {
      images.value.length = 0;
      add(-1);
    } else
      images.value = value.images.map(({ alt = "", url = "" }) => ({
        alt,
        url,
      }));
  },
  { immediate },
);

onChange((files) => {
  const image = images.value[index];
  if (files && image) {
    const [file] = files;
    if (file) {
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
        })().catch(consola.error);
        urls.set(filePath, URL.createObjectURL(file));
        image.url = filePath;
      } else
        $q.notify({
          message: t(
            "The graphic file type is not suitable for use on the web",
          ),
        });
    }
  }
});
</script>
