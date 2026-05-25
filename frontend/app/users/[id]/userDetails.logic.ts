"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type UserDetailsData = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

type DeleteUserResponse = {
  message?: string | string[];
  user?: {
    id: string;
    email: string;
  };
};

async function fetchUserDetails(id: string): Promise<UserDetailsData> {
  const response = await fetch(`/api/users/${id}`);

  if (!response.ok) {
    throw new Error("Failed to load user");
  }

  return response.json() as Promise<UserDetailsData>;
}

export function useUserDetails(id: string) {
  return useQuery({
    queryKey: ["user-details", id],
    queryFn: () => fetchUserDetails(id),
    enabled: id.length > 0,
  });
}

async function deleteUser(id: string): Promise<DeleteUserResponse> {
  const response = await fetch(`/api/users/${id}`, {
    method: "DELETE",
  });

  const data = (await response.json()) as DeleteUserResponse;

  if (!response.ok) {
    const backendMessage = Array.isArray(data.message)
      ? data.message[0]
      : data.message;

    throw new Error(backendMessage || "Failed to delete user");
  }

  return data;
}

export function useDeleteUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteUser(userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["recentUsers"] });
      await queryClient.invalidateQueries({ queryKey: ["users-page-list"] });
      await queryClient.invalidateQueries({ queryKey: ["recentVehicles"] });
    },
  });
}
