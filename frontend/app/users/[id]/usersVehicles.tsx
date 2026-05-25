"use client";

import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

type UsersVehiclesProps = {
  userId: string;
};

type VehicleItem = {
  id: number;
  make: string | null;
  model: string | null;
  year: number | null;
  user_id: string;
  created_at: string;
  updated_at: string;
};

type VehiclesResponse = {
  items: VehicleItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

const PAGE_SIZE = 8;

async function fetchUserVehicles(
  userId: string,
  page: number,
): Promise<VehiclesResponse> {
  const params = new URLSearchParams({
    user_id: userId,
    page: String(page),
    limit: String(PAGE_SIZE),
  });

  const response = await fetch(`/api/vehicles?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to load vehicles");
  }

  return response.json() as Promise<VehiclesResponse>;
}

export default function UsersVehicles({ userId }: UsersVehiclesProps) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["user-vehicles", userId],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchUserVehicles(userId, Number(pageParam)),
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    enabled: userId.length > 0,
  });

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

  const vehicles = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.meta.total ?? 0;

  return (
    <section className="rounded-[32px] border border-white/12 bg-white/6 p-5 backdrop-blur-sm sm:p-6">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] tracking-[0.24em] text-cyan-200/55 uppercase">
            Vehicles
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            User vehicles
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Scroll to load more vehicles for this user.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <div className="w-fit rounded-full border border-cyan-300/15 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100">
            {total} vehicles total
          </div>

          <Link
            href={`/createVehicle?userId=${encodeURIComponent(userId)}`}
            className="inline-flex h-12 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/12 px-5 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100 transition-colors hover:bg-cyan-300/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45"
          >
            Add vehicle
          </Link>
        </div>
      </div>

      <div className="mt-5">
        {isLoading ? <VehiclesSkeleton /> : null}

        {isError ? (
          <div className="rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-5 py-8 text-center text-sm text-rose-200">
            Could not load user vehicles.
          </div>
        ) : null}

        {!isLoading && !isError && vehicles.length === 0 ? (
          <div className="rounded-[24px] border border-white/10 bg-white/5 px-5 py-8 text-center text-sm text-zinc-400">
            This user has no vehicles yet.
          </div>
        ) : null}

        {!isLoading && !isError && vehicles.length > 0 ? (
          <div className="space-y-3">
            {vehicles.map((vehicle) => (
              <Link
                key={vehicle.id}
                href={`/vehicles/${vehicle.id}`}
                className="block rounded-[24px] border border-white/10 bg-slate-950/30 p-4 transition-colors hover:border-cyan-300/25 hover:bg-slate-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-white">
                      {vehicle.make ?? "Unknown"} {vehicle.model ?? "Unknown"}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      Year: {vehicle.year ?? "Unknown"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-cyan-300/10 bg-white/5 px-3 py-2 text-sm text-zinc-300">
                    <p>Vehicle #{vehicle.id}</p>
                    <p className="mt-1 text-zinc-500">
                      Added {formatDate(vehicle.created_at)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}

            <div ref={loadMoreRef} className="h-2 w-full" />

            {isFetchingNextPage ? <VehiclesFetchingState /> : null}

            {!hasNextPage ? (
              <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-zinc-400">
                All vehicles are loaded.
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function VehiclesSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="h-24 animate-pulse rounded-[24px] border border-white/10 bg-white/5"
        />
      ))}
    </div>
  );
}

function VehiclesFetchingState() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 2 }, (_, index) => (
        <div
          key={index}
          className="h-24 animate-pulse rounded-[24px] border border-white/10 bg-white/5"
        />
      ))}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
