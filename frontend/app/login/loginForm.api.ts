"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";

type LoginResponse = {
  message?: string | string[];
  account?: {
    id: string;
    email: string;
  };
};

async function loginUser(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = (await response.json()) as LoginResponse;

  if (!response.ok) {
    const backendMessage = Array.isArray(data.message)
      ? data.message[0]
      : data.message;

    throw new Error(backendMessage || "Failed to login");
  }

  return data;
}

export function useLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const nextPath = searchParams.get("next") || "/";

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUser(email, password),
    onSuccess: (data) => {
      setStatusMessage(
        data.account?.email
          ? `Welcome back, ${data.account.email}. Redirecting...`
          : "Login successful. Redirecting...",
      );

      router.push(nextPath);
      router.refresh();
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to login";
      setFieldError(message);
      setStatusMessage(message);
    },
  });

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);

    if (fieldError) {
      setFieldError(null);
      setStatusMessage(null);
    }
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);

    if (fieldError) {
      setFieldError(null);
      setStatusMessage(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFieldError(null);
    setStatusMessage(null);

    await loginMutation.mutateAsync({
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });
  };

  return {
    email,
    password,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    isSubmitting: loginMutation.isPending,
    fieldError,
    statusMessage,
  };
}
