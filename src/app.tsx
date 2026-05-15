import { Capacitor } from '@capacitor/core';
import { NativeNavigation } from '@capgo/capacitor-native-navigation';
import { useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { setDirection, setupRouterOutlet } from '@capgo/capacitor-transitions/react';
import Router from "./router";

const NATIVE_TABS = [
  {
    id: 'home',
    title: 'Home',
    icon: {
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/></svg>',
    },
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: {
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 20.5 6.5 20.5 17.5 12 22 3.5 17.5 3.5 6.5"/><circle cx="12" cy="12" r="3.5"/></svg>',
    },
  },
] as const;

function getSelectedTabId(pathname: string) {
  if (pathname === '/app') return 'home';
  if (pathname === '/app/settings') return 'settings';
  return undefined;
}

function getTabRoute(id: string) {
  if (id === 'home') return '/app';
  if (id === 'settings') return '/app/settings';
  return undefined;
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const outletRef = useRef<HTMLElement>(null);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (outletRef.current) {
      setupRouterOutlet(outletRef.current, { platform: 'auto', swipeGesture: 'auto' });
    }
  }, []);

  useEffect(() => {
    if (!isNative) return;

    void NativeNavigation.configure({
      contentInsetMode: 'css',
    });
  }, [isNative]);

  useEffect(() => {
    if (!isNative) return;

    const syncTabbar = async () => {
      const selectedId = getSelectedTabId(location.pathname);

      await NativeNavigation.setTabbar({
        hidden: !selectedId,
        selectedId,
        labels: true,
        icons: true,
        tabs: [...NATIVE_TABS],
      });
    };

    void syncTabbar();
  }, [isNative, location.pathname]);

  useEffect(() => {
    if (!isNative) return;

    let cancelled = false;

    const setupListeners = async () => {
      const tabHandle = await NativeNavigation.addListener('tabSelect', ({ id }) => {
        const target = getTabRoute(id);
        if (!target) return;

        setDirection('none');
        navigate(target, { replace: true });
      });

      if (cancelled) {
        await tabHandle.remove();
      }

      return tabHandle;
    };

    let handlePromise = setupListeners();

    return () => {
      cancelled = true;
      void handlePromise.then((handle) => handle?.remove());
    };
  }, [isNative, navigate]);

  return (
    <cap-router-outlet ref={outletRef}>
      <Router location={location} />
    </cap-router-outlet>
  );
}

export default App;
