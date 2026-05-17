"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";

type RegisterResponse = {
  message?: string | string[];
  account?: {
    id: string;
    email: string;
  };
};

async function registerUser(
  email: string,
  password: string,
): Promise<RegisterResponse> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = (await response.json()) as RegisterResponse;

  if (!response.ok) {
    const backendMessage = Array.isArray(data.message)
      ? data.message[0]
      : data.message;

    throw new Error(backendMessage || "Failed to register user");
  }

  return data;
}

export function useRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const nextPath = searchParams.get("next") || "/";

  const registerMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      registerUser(email, password),
    onSuccess: (data) => {
      setStatusMessage(
        data.account?.email
          ? `Registered as ${data.account.email}. Redirecting...`
          : "Registration successful. Redirecting...",
      );

      router.push(nextPath);
      router.refresh();
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Failed to register user";

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

    await registerMutation.mutateAsync({
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
    isSubmitting: registerMutation.isPending,
    fieldError,
    statusMessage,
  };
}
