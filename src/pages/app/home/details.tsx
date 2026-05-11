import { useRef, useEffect } from 'react';
import { setupPage } from '@capgo/capacitor-transitions/react';
import Header from "@/components/header";

export default function Details() {
  const pageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (pageRef.current) {
      return setupPage(pageRef.current);
    }
  }, []);

  return (
    <cap-page ref={pageRef}>
      <Header title="Details" />
    </cap-page>
  );
}
