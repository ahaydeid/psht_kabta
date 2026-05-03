import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { LoadingOverlay } from '@/Components/ui';

const adminAppName = import.meta.env.VITE_APP_NAME ?? 'Sisfo PSHT Kabta';
const publicAppName = 'PSHT Cabang Kab. Tangerang';
const loadingLogoSrc = '/img/logo-psht.webp';
type PageModule = { default: ComponentType };
const pages = import.meta.glob<PageModule>('./Pages/**/*.tsx');
const initialPathname = window.location.pathname.replace(/\/+$/, '') || '/';

declare global {
    interface Window {
        hasClosedHomeInformationModal?: boolean;
        hasPlayedHomeIntroAnimation?: boolean;
        initialAppPathname?: string;
    }
}

window.initialAppPathname = initialPathname;

function getAppName() {
    const path = window.location.pathname;

    return path.startsWith('/admin') ? adminAppName : publicAppName;
}

function preloadLoadingLogo() {
    const preloadLink = document.createElement('link');

    preloadLink.as = 'image';
    preloadLink.href = loadingLogoSrc;
    preloadLink.rel = 'preload';
    preloadLink.type = 'image/webp';
    document.head.appendChild(preloadLink);
}

function InertiaLoadingIndicator() {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let loadingTimeout: ReturnType<typeof window.setTimeout> | null = null;

        const stopStartListener = router.on('start', () => {
            loadingTimeout = window.setTimeout(() => setIsLoading(true), 200);
        });
        const stopFinishListener = router.on('finish', () => {
            if (loadingTimeout) {
                window.clearTimeout(loadingTimeout);
                loadingTimeout = null;
            }

            setIsLoading(false);
        });

        return () => {
            if (loadingTimeout) {
                window.clearTimeout(loadingTimeout);
            }

            stopStartListener();
            stopFinishListener();
        };
    }, []);

    return <LoadingOverlay show={isLoading} />;
}

preloadLoadingLogo();

createInertiaApp({
    title: (title) => (title ? `${title} - ${getAppName()}` : getAppName()),
    resolve: (name) =>
        resolvePageComponent<PageModule>(
            `./Pages/${name}.tsx`,
            pages,
        ).then((module) => module.default),
    setup({ el, App, props }) {
        createRoot(el).render(
            <>
                <App {...props} />
                <InertiaLoadingIndicator />
            </>,
        );
    },
    progress: {
        color: '#16a34a',
    },
});
