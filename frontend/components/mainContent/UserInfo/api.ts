"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type UserInfoData = {
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

async function fetchUserInfo(id: string): Promise<UserInfoData> {
  const response = await fetch(`/api/users/${id}`);

  if (!response.ok) {
    throw new Error("Failed to load user");
  }

  return response.json() as Promise<UserInfoData>;
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

export function useUserInfo(userId: string) {
  return useQuery({
    queryKey: ["user-info", userId],
    queryFn: () => fetchUserInfo(userId),
    enabled: userId.length > 0,
    retry: false,
  });
}

export function useDeleteUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteUser(userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["recentUsers"] });
      await queryClient.invalidateQueries({ queryKey: ["users-page-list"] });
      await queryClient.invalidateQueries({ queryKey: ["recentVehicles"] });
      queryClient.removeQueries({ queryKey: ["user-info", userId] });
      queryClient.removeQueries({ queryKey: ["user-details", userId] });
    },
  });
}
