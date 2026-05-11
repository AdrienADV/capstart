import { useRef, useEffect } from 'react';
import { useLocation } from 'react-router';
import { setupRouterOutlet } from '@capgo/capacitor-transitions/react';
import Router from "./router";

function App() {
  const location = useLocation();
  const outletRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (outletRef.current) {
      setupRouterOutlet(outletRef.current, { platform: 'auto', swipeGesture: 'auto' });
    }
  }, []);

  return (
    <cap-router-outlet ref={outletRef}>
      <Router location={location} />
    </cap-router-outlet>
  );
}

export default App;
