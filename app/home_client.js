// app/HomeClient.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function HomeClient({ children, HomePage }) {
  const pathname = usePathname();

  const [isAuth, setIsAuth] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuth(!!token);
    setReady(true);
  }, [pathname]);

  if (!ready) return null;

  return isAuth ? <HomePage /> : children;
}
