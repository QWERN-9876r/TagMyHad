import { isDev } from './isDev'

export const log = (...args: unknown[]) => {
    if (!isDev()) return

    console.log(...args)
}
