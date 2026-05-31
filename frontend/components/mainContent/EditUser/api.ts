"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";

type StatusType = "idle" | "success" | "error";

type UserDetailsData = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

type UpdateUserResponse = {
  message?: string | string[];
  user?: UserDetailsData;
};

async function fetchUser(id: string): Promise<UserDetailsData> {
  const response = await fetch(`/api/users/${id}`);

  if (!response.ok) {
    throw new Error("Failed to load user");
  }

  return response.json() as Promise<UserDetailsData>;
}

async function updateUser(
  userId: string,
  email: string,
): Promise<UpdateUserResponse> {
  const response = await fetch(`/api/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = (await response.json()) as UpdateUserResponse;

  if (!response.ok) {
    const backendMessage = Array.isArray(data.message)
      ? data.message[0]
      : data.message;

    throw new Error(backendMessage || "Failed to update user");
  }

  return data;
}

export function useEditUserForm(userId: string) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<StatusType>("idle");
  const [emailError, setEmailError] = useState<string | null>(null);

  const userQuery = useQuery({
    queryKey: ["user-info", userId],
    queryFn: () => fetchUser(userId),
    enabled: userId.length > 0,
    retry: false,
  });

  useEffect(() => {
    if (!userQuery.data) {
      return;
    }

    setEmail(userQuery.data.email);
  }, [userQuery.data]);

  const updateUserMutation = useMutation({
    mutationFn: (nextEmail: string) => updateUser(userId, nextEmail),
    onSuccess: async (data) => {
      setStatusType("success");
      setStatusMessage(
        data.message
          ? `${data.message}${data.user?.email ? `: ${data.user.email}` : ""}`
          : "User updated successfully",
      );

      await queryClient.invalidateQueries({ queryKey: ["user-info", userId] });
      await queryClient.invalidateQueries({ queryKey: ["user-details", userId] });
      await queryClient.invalidateQueries({ queryKey: ["recentUsers"] });
      await queryClient.invalidateQueries({ queryKey: ["users-page-list"] });
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

    if (emailError) {
      setEmailError(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    setEmailError(null);
    setStatusMessage(null);
    setStatusType("idle");

    if (!userId) {
      setStatusType("error");
      setStatusMessage("User id is missing in the URL.");
      return;
    }

    try {
      await updateUserMutation.mutateAsync(normalizedEmail);
    } catch {
      // The mutation onError handler already maps backend errors to form UI state.
    }
  };

  return {
    email,
    emailError,
    handleEmailChange,
    handleSubmit,
    isSubmitting: updateUserMutation.isPending,
    isLoadingUser: userQuery.isLoading,
    isUserError: userQuery.isError,
    statusMessage,
    statusType,
  };
}
