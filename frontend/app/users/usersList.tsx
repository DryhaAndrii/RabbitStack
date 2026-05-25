"use client";

import { useEffect, useRef } from "react";
import ElectricBorder from "@/components/surfaces/ElectricBorder";
import UserListItem from "./userListItem";
import { useUsersList } from "./usersList.logic";

export default function UsersList() {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useUsersList();

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || !hasNextPage || isFetchingNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (firstEntry?.isIntersecting) {
          void fetchNextPage();
        }
      },
      {
        rootMargin: "200px 0px",
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const users = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.meta.total ?? 0;

  return (
    <>
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] tracking-[0.34em] text-cyan-200/65 uppercase">
            Users Directory
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            All users
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
            Scroll down and the next batch will load automatically.
          </p>
        </div>

        <div className="w-fit rounded-full border border-cyan-300/15 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100">
          {total} users total
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? <UsersListSkeleton /> : null}

        {isError ? (
          <div className="rounded-[28px] border border-rose-400/20 bg-rose-400/10 px-5 py-8 text-center text-sm text-rose-200">
            Could not load users from the backend.
          </div>
        ) : null}

        {!isLoading && !isError && users.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-white/5 px-5 py-8 text-center text-sm text-zinc-400">
            No users yet.
          </div>
        ) : null}

        {!isLoading && !isError && users.length > 0 ? (
          <div className="space-y-4">
            {users.map((user) => (
              <UserListItem key={user.id} user={user} />
            ))}

            <div ref={loadMoreRef} className="h-2 w-full" />

            {isFetchingNextPage ? <UsersListFetchingState /> : null}

            {!hasNextPage ? (
              <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-zinc-400">
                All users are loaded.
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}

function UsersListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="h-28 animate-pulse rounded-[28px] border border-white/10 bg-white/5"
        />
      ))}
    </div>
  );
}

function UsersListFetchingState() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="h-24 animate-pulse rounded-[28px] border border-white/10 bg-white/5"
        />
      ))}
    </div>
  );
}
