"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";

type StatusType = "idle" | "success" | "error";

type CreateUserResponse = {
  message?: string | string[];
  user?: {
    id: string;
    email: string;
  };
};

async function createUser(email: string): Promise<CreateUserResponse> {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = (await response.json()) as CreateUserResponse;

  if (!response.ok) {
    const backendMessage = Array.isArray(data.message)
      ? data.message[0]
      : data.message;

    throw new Error(backendMessage || "Failed to save user");
  }

  return data;
}

export function useCreateUserForm() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<StatusType>("idle");
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    setEmailError(getEmailError(email));
  }, [email]);

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: async (data) => {
      setStatusType("success");
      setStatusMessage(
        data.message
          ? `${data.message}${data.user?.email ? `: ${data.user.email}` : ""}`
          : "User saved successfully",
      );
      setEmail("");

      await queryClient.invalidateQueries({ queryKey: ["recentUsers"] });
      await queryClient.invalidateQueries({ queryKey: ["users-page-list"] });
      await queryClient.invalidateQueries({ queryKey: ["recentVehicles"] });
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "Could not reach backend. Check nginx/auth-service routing.";

      setStatusType("error");
      setStatusMessage(message);
      setEmailError(message);
    },
  });

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    clearStatusMessage();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    setEmailError(null);
    setStatusMessage(null);
    setStatusType("idle");

    const nextEmailError = getEmailError(normalizedEmail);

    if (nextEmailError) {
      setEmailError(nextEmailError);
      setStatusType("error");
      setStatusMessage(nextEmailError);
      return;
    }

    try {
      await createUserMutation.mutateAsync(normalizedEmail);
    } catch {
      // The mutation onError handler already maps backend errors to form UI state.
    }
  };

  return {
    email,
    emailError,
    handleEmailChange,
    handleSubmit,
    isSubmitting: createUserMutation.isPending,
    statusMessage,
    statusType,
  };

  function clearStatusMessage() {
    if (statusMessage || statusType !== "idle") {
      setStatusMessage(null);
      setStatusType("idle");
    }
  }
}

function getEmailError(value: string) {
  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === "") {
    return "Email is required.";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalizedValue)) {
    return "Please provide a valid email address.";
  }

  return null;
}
