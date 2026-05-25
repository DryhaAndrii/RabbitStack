"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import GlassContainer from "@/components/surfaces/GlassContainer";
import { useDeleteVehicle, useVehicleDetails } from "./vehicleDetails.logic";

type VehicleDetailsProps = {
  vehicleId: string;
};

export default function VehicleDetails({ vehicleId }: VehicleDetailsProps) {
  const router = useRouter();
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const { data, isLoading, isError } = useVehicleDetails(vehicleId);
  const deleteVehicleMutation = useDeleteVehicle(vehicleId);

  const handleDeleteClick = async () => {
    if (!isDeleteConfirmVisible) {
      setIsDeleteConfirmVisible(true);
      return;
    }

    const result = await deleteVehicleMutation.mutateAsync();
    const ownerId = result.vehicle?.user_id;
    router.push(ownerId ? `/users/${ownerId}` : "/users");
  };

  return (
    <GlassContainer className="w-full">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Vehicle Details
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Vehicle profile
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Information loaded by vehicle id from the backend.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/users"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/8 px-5 text-sm font-semibold uppercase tracking-[0.22em] text-zinc-100 transition-colors hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45"
            >
              Users
            </Link>

            {data ? (
              <Link
                href={`/users/${data.user_id}`}
                className="inline-flex h-12 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/12 px-5 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100 transition-colors hover:bg-cyan-300/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45"
              >
                Owner
              </Link>
            ) : null}

            <Link
              href={`/editVehicle?vehicleId=${encodeURIComponent(vehicleId)}`}
              className="inline-flex h-12 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/12 px-5 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100 transition-colors hover:bg-cyan-300/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45"
            >
              Edit vehicle
            </Link>

            <button
              type="button"
              onClick={() => {
                void handleDeleteClick();
              }}
              disabled={deleteVehicleMutation.isPending}
              className="inline-flex h-12 items-center justify-center rounded-full border border-rose-300/30 bg-rose-300/12 px-5 text-sm font-semibold uppercase tracking-[0.22em] text-rose-100 transition-colors hover:bg-rose-300/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/45 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleteVehicleMutation.isPending
                ? "Deleting..."
                : isDeleteConfirmVisible
                  ? "Are you sure you want to delete?"
                  : "Delete vehicle"}
            </button>
          </div>
        </div>

        {isLoading ? <VehicleDetailsSkeleton /> : null}

        {isError ? (
          <div className="rounded-[28px] border border-rose-400/20 bg-rose-400/10 px-5 py-8 text-center text-sm text-rose-200">
            Could not load this vehicle.
          </div>
        ) : null}

        {deleteVehicleMutation.isError ? (
          <div className="rounded-[28px] border border-rose-400/20 bg-rose-400/10 px-5 py-4 text-center text-sm text-rose-200">
            {deleteVehicleMutation.error instanceof Error
              ? deleteVehicleMutation.error.message
              : "Could not delete this vehicle."}
          </div>
        ) : null}

        {data ? (
          <div className="grid gap-4">
            <DetailCard
              label="Vehicle"
              value={`${data.make ?? "Unknown"} ${data.model ?? "Unknown"}`}
            />
            <DetailCard label="Vehicle ID" value={String(data.id)} />
            <DetailCard label="Year" value={String(data.year ?? "Unknown")} />
            <DetailCard label="Owner ID" value={data.user_id} />
            <DetailCard label="Created" value={formatDate(data.created_at)} />
            <DetailCard label="Updated" value={formatDate(data.updated_at)} />
          </div>
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

function VehicleDetailsSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 6 }, (_, index) => (
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
