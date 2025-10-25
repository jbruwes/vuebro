<template lang="pug">
q-dialog(ref="dialogRef", full-height, @hide="onDialogHide")
  q-card.q-dialog-plugin.column
    q-card-section.q-dialog__title {{ t("Fonts") }}
    q-card-section.q-dialog__message {{ t("Use web fonts from Google Fonts by simply providing the font names") }}
    q-card-section.q-dialog-plugin__form.col(horizontal)
      q-table.h-full.w-full(
        v-model:selected="selected",
        :columns,
        :rows,
        :rows-per-page-options="[0]",
        dense,
        flat,
        :filter,
        hide-bottom,
        row-key="id",
        selection="multiple",
        separator="none"
      )
        template(#top-left)
          q-btn-group(outline)
            q-btn(
              color="primary",
              icon="add",
              outline,
              @click="rows.push({ id: uid(), name: '' })"
            )
            q-btn(color="primary", icon="remove", outline, @click="removeRow")
        template(#top-right)
          q-input(
            v-model="filter",
            borderless,
            debounce="300",
            placeholder="Search"
          )
            template(#append)
              q-icon(name="search")
        template(#body-cell="props")
          q-td(:props)
            q-input.min-w-20(
              v-model.trim="props.row[props.col.name]",
              dense,
              autofocus
            )
    q-card-actions(align="right")
      q-btn(
        color="primary",
        :label="t('Cancel')",
        flat,
        @click="onDialogCancel"
      )
      q-btn(
        color="primary",
        label="Ok",
        flat,
        @click="onDialogOK(rows.map(({ name }) => name).filter(Boolean))"
      )
</template>

<script setup lang="ts">
import type { QTableProps } from "quasar";

import { useDialogPluginComponent, useQuasar, uid } from "quasar";
import json from "assets/fonts.json";
import { useI18n } from "vue-i18n";
import { ref } from "vue";

const { onDialogCancel, onDialogHide, onDialogOK, dialogRef } =
    useDialogPluginComponent(),
  { fonts } = defineProps<{ fonts: string[] }>(),
  { t } = useI18n();

const rows = ref(fonts.map((name) => ({ id: uid(), name }))),
  selected = ref<Record<string, string>[]>([]),
  columns = json as QTableProps["columns"],
  $q = useQuasar(),
  filter = ref("");

const removeRow = () => {
  if (selected.value.length)
    $q.dialog({
      message: t("Do you really want to delete?"),
      title: t("Confirm"),
      persistent: true,
      cancel: true,
    }).onOk(() => {
      const set = new Set(selected.value);
      rows.value = rows.value.filter((x) => !set.has(x));
    });
};

defineEmits([...useDialogPluginComponent.emits]);
</script>
