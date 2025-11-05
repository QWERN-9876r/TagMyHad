import { Router } from '@vaadin/router'

export let router: Router

export function initRouter(outlet: HTMLElement) {
    router = new Router(outlet)

    router.setRoutes([
        {
            path: '/',
            component: 'home-page',
            action: async () => {
                await import('./pages/home-page')
            },
        },
        {
            path: '/room/:code',
            component: 'lobby-page',
            action: async () => {
                await import('./pages/lobby-page')
            },
        },
        {
            path: '/room/:code/game',
            component: 'game-page',
            action: async () => {
                await import('./pages/game-page')
            },
        },
        {
            path: '(.*)',
            redirect: '/',
        },
    ])
}

export function navigate(path: string) {
    Router.go(path)
}
