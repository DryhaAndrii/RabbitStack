"use client";

import { useQuery } from "@tanstack/react-query";
import AnimatedList from "../surfaces/AnimatedList";

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

  const userItems =
    data?.items.map((user) => ({
      id: user.id,
      label: user.email,
      href: `/?userId=${user.id}`,
    })) ?? [];

  return (
    <div className="relative flex min-h-[400px] w-[300px] self-stretch flex-col border border-cyan-300/25 bg-slate-950/35 p-4 shadow-[0_0_0_1px_rgba(125,249,255,0.06),0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-sm">
      <h1 className="text-xl font-semibold tracking-tight text-white ">
        Recent users
      </h1>
      <div className="mt-4 min-h-0 w-full flex-1">
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
            displayScrollbar={false}
          />
        )}
      </div>
    </div>
  );
}
