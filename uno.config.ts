import presets from "@vuebro/configs/uno/presets";
import config from "@vuebro/configs/uno";
import { defineConfig } from "unocss";

export default defineConfig({ presets: presets(), ...config });
