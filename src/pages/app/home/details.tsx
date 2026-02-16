import Header from "@/components/header";
import { setupPage } from "@capgo/transitions/react";
import { useEffect, useRef } from "react";

export default function Details() {
  const pageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (pageRef.current) {
      return setupPage(pageRef.current);
    }
  }, []);

  return (
    <cap-page ref={pageRef}>
      <cap-header slot="header">
        <Header title="Details" />
      </cap-header>
      <cap-content slot="content">
        <div />
      </cap-content>
    </cap-page>
  );
}
