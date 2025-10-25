<template lang="pug">
q-dialog(ref="dialogRef", @hide="onDialogHide")
  q-card.q-dialog-plugin
    q-card-section.row.q-gutter-sm.justify-center
      q-input(
        v-for="i in length",
        :key="i",
        :ref="(el) => { updateFieldRef(el, i - 1); }",
        v-model="fieldValues[i - 1]",
        :class="{ 'bg-negative': error }",
        autofocus,
        input-class="text-center",
        mask="#",
        maxlength="1",
        outlined,
        style="width: 6ch",
        type="password",
        @blur="fields[selected]?.focus()",
        @click="selected = i - 1",
        @keydown.tab.prevent,
        @keyup.delete="focus(i - 2)",
        @keyup.left="focus(i - 2)",
        @keyup.right="focus(i)",
        @update:model-value="(ev) => { if (ev) focus(i); }"
      )
</template>

<script setup lang="ts">
import type { ComponentPublicInstance } from "vue";
import type { QInput } from "quasar";

import { useDialogPluginComponent } from "quasar";
import { computed, watch, ref } from "vue";
import CryptoJS from "crypto-js";

const { onDialogHide, onDialogOK, dialogRef } = useDialogPluginComponent(),
  { model } = defineProps<{
    model: string;
  }>();

const payload = computed(() => fieldValues.value.filter(Boolean).join("")),
  fieldValues = ref<number[]>([]),
  fields = ref<QInput[]>([]),
  error = ref(false),
  selected = ref(0),
  length = ref(4);

const updateFieldRef = (
    element: ComponentPublicInstance | Element | null,
    index: number,
  ) => {
    fields.value[index] = element as QInput;
  },
  focus = (index: number) => {
    if (index >= 0 && index < length.value) selected.value = index;
  };

defineEmits([...useDialogPluginComponent.emits]);

watch(
  payload,
  (value) => {
    if (value.length === length.value) {
      if (model) error.value = !CryptoJS.AES.decrypt(model, value).toString();
      if (!error.value) onDialogOK(value);
    } else error.value = false;
  },
  { deep: true },
);

watch(selected, (value) => {
  fields.value[value]?.select();
});
</script>
