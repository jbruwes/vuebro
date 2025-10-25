import { defineBoot } from "#q-app/wrappers";
import { createI18n } from "vue-i18n";
import messages from "src/i18n";
import { Lang } from "quasar";

/* -------------------------------------------------------------------------- */

export default defineBoot(({ app }) => {
  app.use(
    createI18n({
      locale: Lang.getLocale() === "ru-RU" ? "ru-RU" : "en-US",
      legacy: false,
      messages,
    }),
  );
});

/* -------------------------------------------------------------------------- */
