<template lang="pug">
q-dialog(ref="dialogRef", @hide="onDialogHide")
  q-card.q-dialog-plugin
    q-card-section.q-dialog-plugin__form.scroll
      q-input(
        ref="bucketRef",
        v-model.trim="Bucket",
        :rules="[(v: null | string) => !!v || t('Item is required')]",
        clearable,
        label="bucket"
      )
        template(#prepend)
          q-icon(name="delete")
      q-input(
        v-model.trim="accessKeyId",
        clearable,
        label="access key id",
        hint=""
      )
        template(#prepend)
          q-icon(name="key")
      q-input(
        v-model.trim="secretAccessKey",
        :type="isPwd ? 'password' : 'text'",
        clearable,
        label="secret access key",
        hint=""
      )
        template(#prepend)
          q-icon(name="lock")
        template(#append)
          q-icon.cursor-pointer(
            :name="isPwd ? 'visibility_off' : 'visibility'",
            @click="isPwd = !isPwd"
          )
      q-select(
        v-model.trim="endpoint",
        :options="endpoints",
        clearable,
        emit-value,
        fill-input,
        hide-selected,
        hint="",
        label="endpoint url",
        type="url",
        use-input,
        @input-value="(value: string) => { endpoint = value; }"
      )
        template(#prepend)
          q-icon(name="link")
      q-select(
        v-model.trim="region",
        :options="getRegions(endpoint)",
        clearable,
        emit-value,
        fill-input,
        hide-selected,
        hint="",
        label="region",
        use-input,
        @input-value="(value: string) => { region = value; }"
      )
        template(#prepend)
          q-icon(name="flag")
    q-card-actions(align="right")
      q-btn(color="primary", flat, label="Cancel", @click="onDialogCancel")
      q-btn(
        color="primary",
        flat,
        label="Ok",
        @click="() => { bucketRef?.validate(); if (!bucketRef?.hasError) click(encrypt({ Bucket, secretAccessKey, region, endpoint, accessKeyId })); }"
      )
</template>

<script setup lang="ts">
import type { QInput } from "quasar";

import { configurable, enumerable, writable } from "stores/defaults";
import { useDialogPluginComponent, useQuasar } from "quasar";
import { useTemplateRef, triggerRef, ref } from "vue";
import endpoints from "assets/endpoints.json";
import regions from "assets/regions.json";
import { credential } from "stores/s3";
import { useI18n } from "vue-i18n";
import CryptoJS from "crypto-js";

const { model = undefined, pin = undefined } = defineProps<{
    model?: string;
    pin?: string;
  }>(),
  { onDialogCancel, onDialogHide, onDialogOK, dialogRef } =
    useDialogPluginComponent(),
  { t } = useI18n();

const decrypt = (value?: string) =>
  pin
    ? CryptoJS.AES.decrypt(value ?? "", pin).toString(CryptoJS.enc.Utf8)
    : (value ?? null);

const cred = credential.value[model ?? ""],
  secretAccessKey = ref(decrypt(cred?.secretAccessKey ?? undefined)),
  accessKeyId = ref(decrypt(cred?.accessKeyId ?? undefined)),
  endpoint = ref(decrypt(cred?.endpoint ?? undefined)),
  Bucket = ref(decrypt(cred?.Bucket ?? undefined)),
  region = ref(decrypt(cred?.region ?? undefined)),
  bucketRef = useTemplateRef<QInput>("bucketRef"),
  isPwd = ref(true),
  $q = useQuasar();

const click = (value: Record<string, string | null>) => {
    if (Bucket.value)
      if (model !== Bucket.value && Reflect.has(credential.value, Bucket.value))
        $q.dialog({
          message: t("That account already exists"),
          title: t("Confirm"),
        });
      else {
        if (model && model !== Bucket.value)
          Reflect.deleteProperty(credential.value, model);
        Reflect.defineProperty(credential.value, Bucket.value, {
          configurable,
          enumerable,
          writable,
          value,
        });
        triggerRef(credential);
        onDialogOK();
      }
  },
  encrypt = (obj: Record<string, string | null>) =>
    pin
      ? Object.fromEntries(
          Object.entries(obj).map(([key, value]) => [
            key,
            CryptoJS.AES.encrypt(value ?? "", pin).toString(),
          ]),
        )
      : obj,
  getRegions = (value: string | null) => regions[(value ?? "") as keyof object];

defineEmits([...useDialogPluginComponent.emits]);
</script>
