/**
 * reuse: {@link https://github.com/soppylzz/soppy-vue/blob/main/commitlint.config.mjs} configs
 * remove preset configs, since we release them by changesets
 */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      // full release without building
      ["feat", "fix", "docs", "style", "refactor", "perf", "build", "chore", "revert"],
    ],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    // disable length check
    "header-max-length": [0, "always", 100],
    "body-max-line-length": [0, "always", 120],
  },
  ignores: [(msg) => msg.startsWith("WIP") || msg.startsWith("Merge")],
  defaultIgnores: true,
}
