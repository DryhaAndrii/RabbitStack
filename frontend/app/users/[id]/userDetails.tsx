"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import GlassContainer from "@/components/surfaces/GlassContainer";
import { useDeleteUser, useUserDetails } from "./userDetails.logic";
import UsersVehicles from "./usersVehicles";

type UserDetailsProps = {
  userId: string;
};

export default function UserDetails({ userId }: UserDetailsProps) {
  const router = useRouter();
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const { data, isLoading, isError } = useUserDetails(userId);
  const deleteUserMutation = useDeleteUser(userId);

  const handleDeleteClick = async () => {
    if (!isDeleteConfirmVisible) {
      setIsDeleteConfirmVisible(true);
      return;
    }

    await deleteUserMutation.mutateAsync();
    router.push("/users");
  };

  return (
    <GlassContainer className="w-full">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              User Details
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              User profile
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Information loaded by user id from the backend.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/users"
              className="inline-flex h-12 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/12 px-5 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100 transition-colors hover:bg-cyan-300/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45"
            >
              To users
            </Link>

            <Link
              href={`/editUser?userId=${encodeURIComponent(userId)}`}
              className="inline-flex h-12 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/12 px-5 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100 transition-colors hover:bg-cyan-300/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45"
            >
              Edit user
            </Link>

            <button
              type="button"
              onClick={() => {
                void handleDeleteClick();
              }}
              disabled={deleteUserMutation.isPending}
              className="inline-flex h-12 items-center justify-center rounded-full border border-rose-300/30 bg-rose-300/12 px-5 text-sm font-semibold uppercase tracking-[0.22em] text-rose-100 transition-colors hover:bg-rose-300/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/45 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleteUserMutation.isPending
                ? "Deleting..."
                : isDeleteConfirmVisible
                  ? "Are you sure you want to delete?"
                  : "Delete user"}
            </button>
          </div>
        </div>

        {isLoading ? <UserDetailsSkeleton /> : null}

        {isError ? (
          <div className="rounded-[28px] border border-rose-400/20 bg-rose-400/10 px-5 py-8 text-center text-sm text-rose-200">
            Could not load this user.
          </div>
        ) : null}

        {deleteUserMutation.isError ? (
          <div className="rounded-[28px] border border-rose-400/20 bg-rose-400/10 px-5 py-4 text-center text-sm text-rose-200">
            {deleteUserMutation.error instanceof Error
              ? deleteUserMutation.error.message
              : "Could not delete this user."}
          </div>
        ) : null}

        {data ? (
          <>
            <div className="grid gap-4">
              <DetailCard label="Email" value={data.email} />
              <DetailCard label="User ID" value={data.id} />
              <DetailCard label="Created" value={formatDate(data.createdAt)} />
              <DetailCard label="Updated" value={formatDate(data.updatedAt)} />
            </div>

            <UsersVehicles userId={data.id} />
          </>
        ) : null}
      </div>
    </GlassContainer>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <section className="rounded-[28px] border border-white/12 bg-white/6 p-5 backdrop-blur-sm">
      <p className="text-[11px] tracking-[0.24em] text-cyan-200/55 uppercase">
        {label}
      </p>
      <p className="mt-3 text-lg font-medium break-all text-white">{value}</p>
    </section>
  );
}

function UserDetailsSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="h-28 animate-pulse rounded-[28px] border border-white/10 bg-white/5"
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
