import { defineShikiSetup, type ShikiSetup } from "@slidev/types"

const shikiSetup: ShikiSetup = defineShikiSetup(() => ({
  themes: {
    dark: "vitesse-dark",
    light: "vitesse-light",
  },
}))

export default shikiSetup
