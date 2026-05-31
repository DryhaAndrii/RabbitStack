"use client";

import Link from "next/link";
import Button from "@/components/Button";
import GlassContainer from "@/components/surfaces/GlassContainer";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDeleteUser, useUserInfo } from "./api";

export default function UserInfo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") ?? "";
  const vehicleId = searchParams.get("vehicleId") ?? "";
  const addVehicle = searchParams.get("addVehicle") === "true";
  const editUser = searchParams.get("editUser") === "true";
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const { data, isLoading, isError } = useUserInfo(userId);
  const deleteUserMutation = useDeleteUser(userId);

  useEffect(() => {
    setIsDeleteConfirmVisible(false);
  }, [userId]);

  if (!userId || addVehicle || editUser || vehicleId) {
    return null;
  }

  const handleDeleteClick = async () => {
    if (!isDeleteConfirmVisible) {
      setIsDeleteConfirmVisible(true);
      return;
    }

    await deleteUserMutation.mutateAsync();
    router.replace("/");
  };

  return (
    <GlassContainer className="min-h-[400px]">
      <div className="flex h-full flex-col gap-5">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              User Overview
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Selected user
            </h2>
            <p className="max-w-xl text-sm leading-6 text-zinc-300">
              Compact profile information for the overview panel.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/?userId=${encodeURIComponent(userId)}&addVehicle=true`}
              className="inline-flex h-12 items-center justify-center border border-cyan-300/30 bg-cyan-300/12 px-5 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100 transition-colors hover:bg-cyan-300/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add vehicle
            </Link>
            <Link
              href={`/?userId=${encodeURIComponent(userId)}&editUser=true`}
              className="inline-flex h-12 items-center justify-center border border-cyan-300/30 bg-cyan-300/12 px-5 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100 transition-colors hover:bg-cyan-300/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Edit user
            </Link>
            <button
              type="button"
              onClick={() => {
                void handleDeleteClick();
              }}
              disabled={deleteUserMutation.isPending}
              className="inline-flex h-12 items-center justify-center border border-rose-300/30 bg-rose-300/12 px-5 text-sm font-semibold uppercase tracking-[0.22em] text-rose-100 transition-colors hover:bg-rose-300/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/45 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleteUserMutation.isPending
                ? "Deleting..."
                : isDeleteConfirmVisible
                  ? "Confirm delete"
                  : "Delete user"}
            </button>
          </div>
        </div>

        {isLoading ? <UserInfoSkeleton /> : null}

        {isError ? (
          <div className="border border-rose-400/20 bg-rose-400/10 px-4 py-6 text-center text-sm text-rose-200">
            Could not load this user.
          </div>
        ) : null}

        {deleteUserMutation.isError ? (
          <div className="border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-center text-sm text-rose-200">
            {deleteUserMutation.error instanceof Error
              ? deleteUserMutation.error.message
              : "Could not delete this user."}
          </div>
        ) : null}

        {data ? (
          <div className="grid gap-3">
            {[
              { label: "Email", value: data.email, accent: true },
              { label: "User ID", value: data.id },
              { label: "Created", value: formatDate(data.createdAt) },
              { label: "Updated", value: formatDate(data.updatedAt) },
            ].map((detail) => (
              <section
                key={detail.label}
                className="border border-white/10 bg-white/5 px-4 py-3"
              >
                <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-200/55">
                  {detail.label}
                </p>
                <p
                  className={`mt-2 break-all text-sm ${
                    detail.accent ? "font-medium text-white" : "text-zinc-300"
                  }`}
                >
                  {detail.value}
                </p>
              </section>
            ))}
          </div>
        ) : null}
      </div>
    </GlassContainer>
  );
}

function UserInfoSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="h-20 animate-pulse border border-white/10 bg-white/5"
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
