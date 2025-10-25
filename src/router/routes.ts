import type { Component } from "vue";

import HomePage from "pages/HomePage.vue";

/* -------------------------------------------------------------------------- */

const component = HomePage as Component,
  path = "/:pathMatch(.*)*",
  name = "Home";

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */

export default [{ component, name, path }];
