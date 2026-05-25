"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

export type UserListItemData = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

type UsersResponse = {
  items: UserListItemData[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

const PAGE_SIZE = 12;

async function fetchUsersPage(page: number): Promise<UsersResponse> {
  const response = await fetch(`/api/users?page=${page}&limit=${PAGE_SIZE}`);

  if (!response.ok) {
    throw new Error("Failed to load users");
  }

  return response.json() as Promise<UsersResponse>;
}

export function useUsersList() {
  return useInfiniteQuery({
    queryKey: ["users-page-list"],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchUsersPage(Number(pageParam)),
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });
}
