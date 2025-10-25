<template lang="pug">
q-dialog(ref="dialogRef", full-width, full-height, @hide="onDialogHide")
  q-card.q-dialog-plugin.column
    q-card-section.q-dialog__title Import Map
    q-card-section.q-dialog__message {{ t("The value is a module specifier map, which provides the mappings between module specifier text that might appear in an import statement or import() operator, and the text that will replace it when the specifier is resolved") }}
    q-card-section.q-dialog-plugin__form.col(horizontal)
      q-table.w-full(
        v-model:selected="selected",
        :columns,
        :rows,
        :rows-per-page-options="[0]",
        dense,
        flat,
        :filter,
        hide-bottom,
        row-key="id",
        selection="single",
        separator="none"
      )
        template(#top-left)
          q-btn-group(outline)
            q-btn(
              color="primary",
              icon="add",
              outline,
              @click="rows.push({ id: uid(), name: '', path: '' })"
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
        template(#body-selection="props")
          q-checkbox(
            v-model="props.selected",
            :disable="external.includes(props.row.name)",
            dense
          )
        template(#body-cell="props")
          q-td(:auto-width="props.col.name === 'name'", :props)
            q-input.min-w-max(
              v-model.trim="props.row[props.col.name]",
              :disable="external.includes(props.row.name)",
              dense,
              :autofocus="props.col.name === 'name'"
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
        @click="onDialogOK(Object.fromEntries(rows.filter(({ name, path }) => path && name).map(({ name, path }) => [name, path])))"
      )
</template>
<script setup lang="ts">
import type { QTableProps } from "quasar";

import { useDialogPluginComponent, useQuasar, uid } from "quasar";
import { staticEntries } from "stores/app";
import json from "assets/importmap.json";
import { useI18n } from "vue-i18n";
import { ref } from "vue";

const { onDialogCancel, onDialogHide, onDialogOK, dialogRef } =
    useDialogPluginComponent(),
  { importmap } = defineProps<{
    importmap: { imports: Record<string, string> };
  }>(),
  external = staticEntries.map(([name]) => name),
  { imports } = importmap,
  { t } = useI18n(),
  filter = ref("");

const rows = ref(
    [
      ...staticEntries,
      ...Object.entries(imports).filter(([name]) => !external.includes(name)),
    ].map(([name = "", path = ""]) => ({
      id: uid(),
      name,
      path,
    })),
  ),
  selected = ref<Record<string, string>[]>([]),
  columns = json as QTableProps["columns"],
  $q = useQuasar();

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
