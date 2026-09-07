import type { ConsolaInstance } from "consola"
import { consola } from "consola"
import chalk from "chalk"

const colors = {
  debug: chalk.blue,
  info: chalk.green,
  warn: chalk.yellow,
  error: chalk.red,
  success: chalk.magenta,
  log: chalk.white,
}

export function createLogger(scope: string): ConsolaInstance {
  const colorFn = colors[scope as keyof typeof colors] || chalk.gray
  return consola.withTag(colorFn(scope))
}

export const sharedLogger = createLogger("shared")
export const addonLogger = createLogger("addon")
export const cquptLogger = createLogger("cqupt")
