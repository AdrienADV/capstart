import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { NativeNavigation } from '@capgo/native-navigation';
import { Capacitor } from '@capacitor/core';
import { setDirection } from '@capgo/transitions/react';

const HOME_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>';
const SETTINGS_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="m4.93 4.93 2.12 2.12"/><path d="m16.95 16.95 2.12 2.12"/><path d="M2 12h3"/><path d="M19 12h3"/><path d="m4.93 19.07 2.12-2.12"/><path d="m16.95 7.05 2.12-2.12"/></svg>';

const TABS = [
    { id: 'home', title: 'Home', icon: { svg: HOME_SVG }, route: '/app' },
    { id: 'settings', title: 'Settings', icon: { svg: SETTINGS_SVG }, route: '/app/settings' },
] as const;

const TAB_DEFS = TABS.map(({ id, title, icon }) => ({ id, title, icon }));

function getActiveTabId(pathname: string): 'home' | 'settings' {
    if (pathname.startsWith('/app/settings')) return 'settings';
    return 'home';
}

export function useNativeTabbar() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        let listenerHandle: { remove: () => void } | null = null;

        const setup = async () => {
            await NativeNavigation.configure({ contentInsetMode: 'css', animationDuration: 360 });
            await NativeNavigation.setTabbar({
                hidden: false,
                selectedId: getActiveTabId(location.pathname),
                tabs: TAB_DEFS,
                labels: true,
                icons: true,
            });

            listenerHandle = await NativeNavigation.addListener('tabSelect', ({ id }) => {
                const tab = TABS.find(t => t.id === id);
                if (!tab) return;
                setDirection('none');
                navigate(tab.route);
            });
        };

        setup();

        return () => {
            listenerHandle?.remove();
            NativeNavigation.setTabbar({ hidden: true, tabs: TAB_DEFS, selectedId: 'home' });
        };
    }, [navigate]);

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;
        NativeNavigation.setTabbar({
            hidden: false,
            selectedId: getActiveTabId(location.pathname),
            tabs: TAB_DEFS,
            labels: true,
            icons: true,
        });
    }, [location.pathname]);
}
