import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { ConfirmDialogProvider } from '@/Contexts/ConfirmDialogContext';
import { ToastProvider } from '@/Contexts/ToastContext';

const appName = import.meta.env.VITE_APP_NAME || 'STC CPOSIMS';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ToastProvider>
                <ConfirmDialogProvider>
                    <App {...props} />
                </ConfirmDialogProvider>
            </ToastProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
