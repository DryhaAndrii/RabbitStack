"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import Button from "@/components/Button";
import Input from "@/components/Input";
import GlassContainer from "@/components/surfaces/GlassContainer";
import { useEditVehicleForm } from "./api";

export default function EditVehicle() {
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get("vehicleId") ?? "";
  const selectedUserId = searchParams.get("userId") ?? "";
  const editVehicle = searchParams.get("editVehicle") === "true";

  const {
    make,
    model,
    year,
    userId,
    yearError,
    handleMakeChange,
    handleModelChange,
    handleYearChange,
    handleSubmit,
    isSubmitting,
    isLoadingVehicle,
    isVehicleError,
    statusMessage,
    statusType,
  } = useEditVehicleForm(vehicleId);
  const resolvedUserId = userId || selectedUserId;

  if (!editVehicle || !vehicleId) {
    return null;
  }

  return (
    <GlassContainer className="min-h-[400px]">
      <div className="flex h-full flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
            Edit Vehicle
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Update vehicle
          </h2>
          <p className="text-sm text-zinc-400">
            Edit the selected vehicle directly inside the overview panel.
          </p>
        </div>

        {isLoadingVehicle ? (
          <div className="border border-white/10 bg-white/5 px-5 py-8 text-center text-sm text-zinc-300">
            Loading vehicle...
          </div>
        ) : isVehicleError ? (
          <div className="border border-rose-400/20 bg-rose-400/10 px-5 py-8 text-center text-sm text-rose-200">
            Could not load vehicle data.
          </div>
        ) : (
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <Input
              name="vehicle_id"
              label="Vehicle ID"
              value={vehicleId}
              hint="This vehicle id comes from the selected vehicle in overview."
              readOnly
            />

            <Input
              name="user_id"
              label="User ID"
              value={userId}
              hint="Vehicle owner stays attached to this user."
              readOnly
            />

            <Input
              name="make"
              type="text"
              label="Make"
              placeholder="Toyota"
              hint="Optional. Empty value will become Unknown on the backend."
              value={make}
              onChange={handleMakeChange}
            />

            <Input
              name="model"
              type="text"
              label="Model"
              placeholder="Corolla"
              hint="Optional. Empty value will become Unknown on the backend."
              value={model}
              onChange={handleModelChange}
            />

            <Input
              name="year"
              type="number"
              label="Year"
              placeholder="2024"
              hint="Optional. Leave empty to store null."
              error={yearError ?? undefined}
              value={year}
              onChange={handleYearChange}
              min="1900"
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex w-full gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting || vehicleId === "" || Boolean(yearError)}
                  className="flex-1 text-xs"
                >
                  {isSubmitting ? "Saving..." : "Save vehicle"}
                </Button>

                <Link
                  href={buildUserPageHref(resolvedUserId)}
                  className="inline-flex h-12 flex-1 items-center justify-center border border-white/15 bg-white/8 px-5 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-100 transition-colors hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45"
                >
                  Back to user
                </Link>

                <Link
                  href={buildVehiclePageHref(vehicleId, selectedUserId)}
                  className="inline-flex h-12 flex-1 items-center justify-center border border-white/15 bg-white/8 px-5 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-100 transition-colors hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45"
                >
                  Back to vehicle
                </Link>
              </div>
            </div>
            {statusMessage ? (
              <p
                className={
                  statusType === "error"
                    ? "text-sm text-rose-300"
                    : "text-sm text-emerald-300"
                }
              >
                {statusMessage}
              </p>
            ) : null}
          </form>
        )}
      </div>
    </GlassContainer>
  );
}

function buildVehiclePageHref(vehicleId: string, userId: string) {
  const params = new URLSearchParams({
    vehicleId,
  });

  if (userId) {
    params.set("userId", userId);
  }

  return `/?${params.toString()}`;
}

function buildUserPageHref(userId: string) {
  if (!userId) {
    return "/";
  }

  return `/?userId=${encodeURIComponent(userId)}`;
}
