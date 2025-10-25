import { defineConfig } from "eslint/config";
import shared from "@vuebro/configs/eslint";

export default defineConfig(shared, {
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
