export const withViewTransition = <T extends (...args: any[]) => any>(
    callback: T,
    context: unknown
) => {
    if (document.startViewTransition) {
        return (...args: Parameters<T>) => {
            document.startViewTransition(() => {
                callback.call(context, ...args)
            })
        }
    } else {
        return callback.bind(context)
    }
}
