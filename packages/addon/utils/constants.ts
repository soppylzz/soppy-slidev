import type { InjectionKey, Ref } from "vue"

export enum DecorKinds {
  tape = "tape",
  pin = "pin",
}
export const ROTATE_INJECTION_KEY: InjectionKey<Ref<number>> = Symbol("soppy-rotate")
