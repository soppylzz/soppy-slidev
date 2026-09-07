import { createPinia } from "pinia"
import { defineAppSetup, type AppSetup } from "@slidev/types"
import BuildingIcon from "../components/icons/building.vue"
import CalendarIcon from "../components/icons/calendar.vue"
import GraduationIcon from "../components/icons/graduation.vue"
import SchoolIcon from "../components/icons/school.vue"

// icon components are consumed by name from other packages (theme/deck) through
// dynamic <component :is>, which only sees globally registered components —
// register them under their stable SoppyIconXxx names here
const ICONS = [BuildingIcon, CalendarIcon, GraduationIcon, SchoolIcon] as const

const appSetup: AppSetup = defineAppSetup(({ app }) => {
  /**
   * both the theme and the addon ship this setup — only the first install wins;
   * a second app.use(createPinia()) would overwrite the app-wide provide and warn
   */
  if (!app.config.globalProperties.$pinia) app.use(createPinia())

  for (const icon of ICONS) {
    const name = (icon as { name?: string }).name
    if (name) app.component(name, icon)
  }
})

export default appSetup
