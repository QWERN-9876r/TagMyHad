import { css } from 'lit'

export const joinRoomFormStyles = css`
    :host {
        display: block;
        min-height: 100vh;
    }

    .join-form-container {
        position: fixed;
        inset-inline-start: 0;
        inset-block-start: 0;
        width: 100%;
        height: 100%;

        display: flex;
        align-items: center;
        justify-content: center;
    }

    .join-form-card {
        background: var(--glass-bg);
        backdrop-filter: var(--glass-blur);
        -webkit-backdrop-filter: var(--glass-blur);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-xl);
        box-shadow: var(--glass-shadow), 0 0 40px rgba(184, 76, 255, 0.2);
        padding: var(--space-2xl);
        max-width: 500px;
        width: 100%;
        /* animation: slideUp 0.5s ease-out; */
    }

    @media (max-width: 768px) {
        .join-form-card {
            background: none;
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
            border: none;
            border-radius: 0;
            box-shadow: none;
            padding: var(--space-xl);
            max-width: none;
            width: 100%;
            animation: slideUp 0.5s ease-out;
        }
    }
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .join-form-header {
        text-align: center;
        margin-bottom: var(--space-xl);
    }

    .join-form-title {
        font-family: var(--font-family-heading);
        font-size: var(--font-size-3xl);
        font-weight: var(--font-weight-bold);
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0 0 var(--space-sm) 0;
        line-height: var(--line-height-tight);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-sm);
    }

    .join-form-subtitle {
        color: var(--color-text-secondary);
        font-size: var(--font-size-base);
        margin: 0;
        line-height: var(--line-height-normal);
    }

    .room-code-display {
        background: rgba(184, 76, 255, 0.1);
        border: 2px solid var(--color-primary);
        border-radius: var(--radius-lg);
        padding: var(--space-lg);
        text-align: center;
        margin: var(--space-xl) 0;
    }

    .room-code-label {
        color: var(--color-text-tertiary);
        font-size: var(--font-size-sm);
        margin-bottom: var(--space-xs);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-weight: var(--font-weight-medium);
    }

    .room-code-value {
        font-family: var(--font-family-heading);
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-primary);
        text-shadow: 0 0 20px var(--color-primary-glow);
        letter-spacing: 0.3em;
        margin-left: 0.3em;
    }

    .join-form-body {
        margin-bottom: var(--space-xl);
    }

    .form-field {
        margin-bottom: 0;
    }

    .form-label {
        display: block;
        color: var(--color-text-secondary);
        font-weight: var(--font-weight-medium);
        margin-bottom: var(--space-sm);
        font-size: var(--font-size-sm);
    }

    .form-input {
        width: 100%;
        background: rgba(31, 31, 71, 0.4);
        backdrop-filter: blur(8px);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: var(--space-md) var(--space-lg);
        color: var(--color-text-primary);
        font-size: var(--font-size-base);
        font-family: var(--font-family);
        transition: all var(--transition-base);
        box-sizing: border-box;
    }

    .form-input:focus {
        background: rgba(31, 31, 71, 0.6);
        border-color: var(--color-primary);
        outline: none;
        box-shadow: 0 0 0 3px rgba(184, 76, 255, 0.2),
            0 0 20px rgba(184, 76, 255, 0.3);
    }

    .form-input::placeholder {
        color: var(--color-text-tertiary);
    }

    .form-input:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .join-form-footer {
        display: flex;
        gap: var(--space-md);
    }

    .btn {
        flex: 1;
        padding: var(--space-md) var(--space-xl);
        border: none;
        border-radius: var(--radius-lg);
        font-family: var(--font-family);
        font-size: var(--font-size-base);
        font-weight: var(--font-weight-semibold);
        cursor: pointer;
        transition: all var(--transition-base);
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-xs);
    }

    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
    }

    .btn-primary {
        background: var(--gradient-primary);
        color: var(--color-text-primary);
        box-shadow: 0 4px 16px rgba(184, 76, 255, 0.4);
    }

    .btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(184, 76, 255, 0.6), var(--glow-primary);
    }

    .btn-primary:active:not(:disabled) {
        transform: translateY(0);
    }

    .btn-ghost {
        background: transparent;
        color: var(--color-text-secondary);
        border: 1px solid var(--glass-border);
    }

    .btn-ghost:hover:not(:disabled) {
        background: rgba(31, 31, 71, 0.4);
        border-color: var(--color-border-hover);
        color: var(--color-text-primary);
    }

    .error-message {
        background: rgba(255, 51, 102, 0.1);
        border: 1px solid var(--color-error);
        border-radius: var(--radius-md);
        padding: var(--space-md);
        color: var(--color-error);
        margin-bottom: var(--space-lg);
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        animation: shake 0.5s ease-in-out;
        font-size: var(--font-size-sm);
    }

    @keyframes shake {
        0%,
        100% {
            transform: translateX(0);
        }
        25% {
            transform: translateX(-10px);
        }
        75% {
            transform: translateX(10px);
        }
    }

    .loading-spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: var(--color-text-primary);
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    @media (max-width: 600px) {
        .join-form-card {
            padding: var(--space-xl);
        }

        .join-form-title {
            font-size: var(--font-size-2xl);
        }

        .room-code-value {
            font-size: var(--font-size-xl);
            letter-spacing: 0.2em;
        }

        .btn {
            font-size: var(--font-size-sm);
            padding: var(--space-sm) var(--space-lg);
        }
    }
`
