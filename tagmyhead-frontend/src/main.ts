import './index.css'
import './components/ui'
import { initRouter } from './router'

const outlet = document.getElementById('outlet')
if (outlet) {
    console.log('Outlet found, initializing router...')
    initRouter(outlet)
} else {
    console.error('Outlet element not found!')
}
