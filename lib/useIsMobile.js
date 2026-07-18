import { useState, useEffect } from "react";

// Simple hook to detect narrow screens, so components can switch layout
// (grid columns, flex direction, sizing) without needing a CSS framework.
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < breakpoint);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}