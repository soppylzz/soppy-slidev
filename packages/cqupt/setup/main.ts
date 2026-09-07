import { createPinia } from "pinia"
import { defineAppSetup, type AppSetup } from "@slidev/types"
import { vMap } from "../directives/vMap"

const appSetup: AppSetup = defineAppSetup(({ app }) => {
  /**
   * both the theme and the addon ship this setup — only the first install wins;
   * a second app.use(createPinia()) would overwrite the app-wide provide and warn
   */
  if (!app.config.globalProperties.$pinia) app.use(createPinia())

  // slide markdown can't reach module-scoped directives, so v-map (map marker
  // registration) is registered globally for <Map> default-slot content; the
  // guard skips a re-registration when this setup runs again (HMR/app reload)
  if (!app.directive("map")) app.directive("map", vMap)
})

export default appSetup
