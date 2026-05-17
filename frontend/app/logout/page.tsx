"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LOGIN_PATH } from "@/middleware";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    let isActive = true;

    const logout = async () => {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
        });
      } finally {
        if (isActive) {
          router.replace(LOGIN_PATH);
          router.refresh();
        }
      }
    };

    void logout();

    return () => {
      isActive = false;
    };
  }, [router]);

  return null;
}
