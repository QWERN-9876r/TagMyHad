import { css } from 'lit'

export const uiComponents = css`
    /* Container */
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--space-xl);
        animation: fadeIn var(--transition-base);
    }

    /* Card */
    .card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-xl);
        padding: var(--space-2xl);
        box-shadow: var(--shadow-lg);
        position: relative;
        overflow: hidden;
        transition: all var(--transition-base);
    }

    .card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, #a78bfa 0%, #f472b6 100%);
    }

    .card:hover {
        border-color: var(--color-border-hover);
        box-shadow: var(--shadow-xl);
        transform: translateY(-2px);
    }

    .card-compact {
        padding: var(--space-lg);
    }

    .card-elevated {
        background: var(--color-bg-elevated);
        box-shadow: var(--shadow-xl), 0 0 40px rgba(167, 139, 250, 0.1);
    }

    /* Glass morphism card */
    .card-glass {
        background: rgba(30, 30, 63, 0.6);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(167, 139, 250, 0.2);
    }

    /* Typography */
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        font-weight: var(--font-weight-bold);
        line-height: var(--line-height-tight);
        background: linear-gradient(135deg, #e2e8f0 0%, #a78bfa 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    h1 {
        font-size: var(--font-size-4xl);
        margin-bottom: var(--space-lg);
    }

    h2 {
        font-size: var(--font-size-3xl);
        margin-bottom: var(--space-md);
    }

    h3 {
        font-size: var(--font-size-2xl);
        margin-bottom: var(--space-md);
    }

    .subtitle {
        color: var(--color-text-secondary);
        font-size: var(--font-size-lg);
        line-height: var(--line-height-relaxed);
        margin-bottom: var(--space-xl);
    }

    /* Buttons */
    button,
    .btn {
        all: unset;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-sm);
        padding: var(--space-md) var(--space-xl);
        border-radius: var(--radius-lg);
        font-size: var(--font-size-base);
        font-weight: var(--font-weight-semibold);
        cursor: pointer;
        transition: all var(--transition-base);
        position: relative;
        overflow: hidden;
        width: 100%;
        margin: var(--space-sm) 0;
    }

    button::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
    }

    button:hover::before {
        width: 300px;
        height: 300px;
    }

    /* Primary Button */
    button,
    .btn-primary {
        background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
        color: white;
        box-shadow: var(--shadow-md), 0 0 20px rgba(167, 139, 250, 0.3);
    }

    button:hover:not(:disabled),
    .btn-primary:hover:not(:disabled) {
        background: linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%);
        box-shadow: var(--shadow-lg), var(--shadow-glow);
        transform: translateY(-2px);
    }

    button:active:not(:disabled) {
        transform: translateY(0);
    }

    button:disabled {
        background: var(--color-bg-tertiary);
        color: var(--color-text-tertiary);
        cursor: not-allowed;
        box-shadow: none;
    }

    /* Secondary Button */
    .btn-secondary {
        background: var(--color-surface);
        color: var(--color-text-primary);
        border: 1px solid var(--color-border);
        box-shadow: var(--shadow-sm);
    }

    .btn-secondary:hover:not(:disabled) {
        background: var(--color-surface-hover);
        border-color: var(--color-primary);
        box-shadow: var(--shadow-md);
    }

    /* Ghost Button */
    .btn-ghost {
        background: transparent;
        color: var(--color-primary);
        border: 1px solid var(--color-primary);
    }

    .btn-ghost:hover:not(:disabled) {
        background: rgba(167, 139, 250, 0.1);
        border-color: var(--color-primary-hover);
    }

    /* Input */
    input,
    textarea {
        all: unset;
        width: 100%;
        padding: var(--space-md);
        margin: var(--space-sm) 0;
        background: var(--color-bg-secondary);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        color: var(--color-text-primary);
        font-size: var(--font-size-base);
        transition: all var(--transition-base);
        box-sizing: border-box;
    }

    input::placeholder,
    textarea::placeholder {
        color: var(--color-text-tertiary);
    }

    input:focus,
    textarea:focus {
        border-color: var(--color-primary);
        background: var(--color-bg-tertiary);
        box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.1);
    }

    input:hover:not(:focus),
    textarea:hover:not(:focus) {
        border-color: var(--color-border-hover);
    }

    /* Badge */
    .badge {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        padding: var(--space-xs) var(--space-md);
        border-radius: var(--radius-full);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        background: linear-gradient(135deg, #a78bfa 0%, #f472b6 100%);
        color: white;
        box-shadow: var(--shadow-sm);
    }

    .badge-secondary {
        background: var(--color-surface);
        color: var(--color-text-primary);
        border: 1px solid var(--color-border);
    }

    .badge-success {
        background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
    }

    .badge-warning {
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    }

    .badge-error {
        background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
    }

    /* Alert */
    .alert {
        padding: var(--space-lg);
        border-radius: var(--radius-lg);
        margin: var(--space-md) 0;
        border-left: 4px solid;
        animation: slideIn var(--transition-base);
    }

    .alert-error {
        background: rgba(248, 113, 113, 0.1);
        border-color: var(--color-error);
        color: var(--color-error);
    }

    .alert-success {
        background: rgba(52, 211, 153, 0.1);
        border-color: var(--color-success);
        color: var(--color-success);
    }

    .alert-info {
        background: rgba(96, 165, 250, 0.1);
        border-color: var(--color-info);
        color: var(--color-info);
    }

    .alert-warning {
        background: rgba(251, 191, 36, 0.1);
        border-color: var(--color-warning);
        color: var(--color-warning);
    }

    /* Divider */
    hr,
    .divider {
        margin: var(--space-2xl) 0;
        border: none;
        height: 1px;
        background: linear-gradient(
            90deg,
            transparent,
            var(--color-border),
            transparent
        );
        position: relative;
    }

    .divider-text {
        position: relative;
        text-align: center;
        margin: var(--space-2xl) 0;
    }

    .divider-text::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(
            90deg,
            transparent,
            var(--color-border),
            transparent
        );
    }

    .divider-text span {
        position: relative;
        background: var(--color-surface);
        padding: 0 var(--space-lg);
        color: var(--color-text-tertiary);
        font-weight: var(--font-weight-semibold);
        font-size: var(--font-size-sm);
        text-transform: uppercase;
        letter-spacing: 0.1em;
    }

    /* Room Code */
    .room-code {
        background: linear-gradient(135deg, #a78bfa 0%, #f472b6 100%);
        padding: var(--space-xl);
        border-radius: var(--radius-xl);
        text-align: center;
        font-size: var(--font-size-4xl);
        font-weight: var(--font-weight-bold);
        font-family: var(--font-mono);
        letter-spacing: 0.3em;
        margin: var(--space-xl) 0;
        cursor: pointer;
        transition: all var(--transition-base);
        user-select: all;
        box-shadow: var(--shadow-lg), var(--shadow-glow);
        position: relative;
        overflow: hidden;
        color: white;
    }

    .room-code::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(
            45deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
        );
        transform: rotate(45deg);
        animation: shimmer 3s infinite;
    }

    .room-code:hover {
        transform: scale(1.02);
        animation: glow 2s infinite;
    }

    .room-code:active {
        transform: scale(0.98);
    }

    /* Loading */
    .loading {
        text-align: center;
        padding: var(--space-3xl);
        color: var(--color-primary);
        font-size: var(--font-size-lg);
        animation: fadeIn var(--transition-base);
    }

    .spinner {
        width: 40px;
        height: 40px;
        margin: var(--space-lg) auto;
        border: 3px solid var(--color-border);
        border-top-color: var(--color-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    /* Grid */
    .grid {
        display: grid;
        gap: var(--space-lg);
    }

    .grid-2 {
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }

    /* Responsive */
    @media (max-width: 768px) {
        .container {
            padding: var(--space-md);
        }

        .card {
            padding: var(--space-lg);
        }

        h1 {
            font-size: var(--font-size-3xl);
        }

        .room-code {
            font-size: var(--font-size-2xl);
            letter-spacing: 0.2em;
        }
    }
`
