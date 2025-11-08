let isDevMode = localStorage.getItem('IS_DEV') === 'true'

export const isDev = () => isDevMode
export const toggleDevMode = () => {
    isDevMode = !isDevMode

    localStorage.setItem('IS_DEV', String(isDevMode))

    console.log('dev mode', isDev() ? 'enabled' : 'disabled')
}
