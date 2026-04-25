import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import type { ComponentType } from 'react';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME ?? 'Sisfo PSHT Kabta';
type PageModule = { default: ComponentType };
const pages = import.meta.glob<PageModule>('./Pages/**/*.tsx');

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent<PageModule>(
            `./Pages/${name}.tsx`,
            pages,
        ).then((module) => module.default),
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#16a34a',
    },
});
