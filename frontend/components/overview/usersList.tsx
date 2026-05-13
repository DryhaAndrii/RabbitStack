"use client";

import { useQuery } from "@tanstack/react-query";
import AnimatedList from "../surfaces/AnimatedList";
import ElectricBorder from "../surfaces/ElectricBorder";

type UsersResponse = {
  items: Array<{
    id: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  }>;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

async function fetchUsers(): Promise<UsersResponse> {
  const response = await fetch("/api/users?page=1&limit=10");

  if (!response.ok) {
    throw new Error("Failed to load users");
  }

  return response.json();
}

export default function UsersList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["recentUsers"],
    queryFn: fetchUsers,
  });

  const userItems = data?.items.map((user) => user.email) ?? [];

  return (
    <ElectricBorder
      color="#7df9ff"
      speed={1}
      chaos={0.12}
      thickness={2}
      style={{ borderRadius: 16 }}
      className="w-[300px] h-[350px] p-4"
    >
      <h1 className="text-xl font-semibold tracking-tight text-white ">
        Recent users
      </h1>
      <div className="w-full h-[300px]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center px-4 text-sm text-zinc-400">
            Loading users...
          </div>
        ) : isError ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-rose-300">
            Could not load users from the backend.
          </div>
        ) : userItems.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4 text-sm text-zinc-400">
            No users yet.
          </div>
        ) : (
          <AnimatedList
            items={userItems}
            onItemSelect={(item, index) => console.log(item, index)}
            showGradients={false}
            enableArrowNavigation
            displayScrollbar={false}
          />
        )}
      </div>
    </ElectricBorder>
  );
}
