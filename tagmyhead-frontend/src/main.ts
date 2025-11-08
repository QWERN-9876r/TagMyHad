import './index.css'
import './components/ui'
import { initRouter } from './router'
import { log } from './utils/log'

const outlet = document.getElementById('outlet')
if (outlet) {
    log('Outlet found, initializing router...')
    initRouter(outlet)
} else {
    console.error('Outlet element not found!')
}
