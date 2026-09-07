import { getCurrentInstance } from "vue"

export function checkSetup(scope: string) {
  const instance = getCurrentInstance()
  if (!instance) {
    throw new Error(`${scope} must be called within a component setup function`)
  }
  return instance
}
