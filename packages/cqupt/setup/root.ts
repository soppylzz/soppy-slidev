import { useHead } from "@unhead/vue"
import { defineRootSetup } from "@slidev/types"

// deck fonts load from CDN <link>s with provider: "none" (see package.json
// slidev.defaults.fonts), so useHead stays the only stylesheet source
export default defineRootSetup(() => {
  useHead({
    link: [
      { rel: "preconnect", href: "https://fonts.googleapis.com", crossorigin: "anonymous" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://cdn.jsdelivr.net/npm/lxgw-wenkai-screen-webfont@latest/style.css",
      },
      // Fira Code keeps the code font loaded (provider: none skips Slidev's fetch)
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fira+Code:wght@200;400;600&display=swap",
      },
    ],
  })
  applyFonts()
})

// The <link>s above load the theme faces; the addon's --soppy-font-* tokens only
// carry generic system stacks, so point the three roles at the loaded families
// once the DOM is up (inline on <html> beats any static stylesheet value).
const FONT_STACKS = {
  sans: '"LXGW WenKai Screen", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  serif: '"Noto Serif SC", "Songti SC", "SimSun", serif',
  mono: '"Fira Code", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
}

function applyFonts() {
  if (typeof document === "undefined") return
  const root = document.documentElement
  root.style.setProperty("--soppy-font-sans", FONT_STACKS.sans)
  root.style.setProperty("--soppy-font-serif", FONT_STACKS.serif)
  root.style.setProperty("--soppy-font-mono", FONT_STACKS.mono)
}
