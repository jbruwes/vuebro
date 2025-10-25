import { createMemoryHistory, createRouter } from "vue-router";
import { defineRouter } from "#q-app/wrappers";

import routes from "./routes";

export default defineRouter(() => {
  const history = createMemoryHistory(process.env.VUE_ROUTER_BASE);
  return createRouter({ history, routes });
});
