import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('app-container')
export class AppContainer extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        .container {
            max-width: 800px; /* Увеличено с 600px */
            margin: 0 auto;
            padding: var(--space-xl);
        }

        @media (max-width: 768px) {
            .container {
                padding: var(--space-md);
            }
        }
    `

    render() {
        return html`
            <div class="container">
                <slot></slot>
            </div>
        `
    }
}
