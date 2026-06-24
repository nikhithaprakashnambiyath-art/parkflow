"use client";

import { useEffect, useState } from "react";

export default function useIsMobile(threshold = 768) {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMatch = () => {
      setIsMobile(window.innerWidth < threshold);
    };

    // Initial check
    checkMatch();

    window.addEventListener("resize", checkMatch);
    return () => window.removeEventListener("resize", checkMatch);
  }, [threshold]);

  return isMobile;
}
