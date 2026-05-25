"use client";

import Link from "next/link";
import Button from "@/components/Button";
import Input from "@/components/Input";
import GlassContainer from "@/components/surfaces/GlassContainer";
import { useEditVehicleForm } from "./api";

type EditVehicleFormProps = {
  vehicleId: string;
};

export default function EditVehicleForm({ vehicleId }: EditVehicleFormProps) {
  const {
    make,
    model,
    year,
    userId,
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

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <GlassContainer className="w-full max-w-xl">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Edit Vehicle
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Update vehicle
            </h1>
            <p className="text-sm text-zinc-400">
              Load current vehicle data, edit the fields and save changes with a
              PUT request.
            </p>
          </div>

          {isLoadingVehicle ? (
            <div className="rounded-[28px] border border-white/10 bg-white/5 px-5 py-8 text-center text-sm text-zinc-300">
              Loading vehicle...
            </div>
          ) : isVehicleError ? (
            <div className="rounded-[28px] border border-rose-400/20 bg-rose-400/10 px-5 py-8 text-center text-sm text-rose-200">
              Could not load vehicle data.
            </div>
          ) : (
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <Input
                name="vehicle_id"
                label="Vehicle ID"
                value={vehicleId}
                hint="This vehicle id comes from the previous page."
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
                value={year}
                onChange={handleYearChange}
                min="1900"
              />

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting || vehicleId === ""}
                  >
                    {isSubmitting ? "Saving..." : "Save vehicle"}
                  </Button>

                  {vehicleId ? (
                    <Link
                      href={`/vehicles/${vehicleId}`}
                      className="inline-flex h-12 items-center justify-center border border-white/15 bg-white/8 px-5 text-sm font-semibold uppercase tracking-[0.22em] text-zinc-100 transition-colors hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45"
                    >
                      Back to vehicle
                    </Link>
                  ) : null}
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
              </div>
            </form>
          )}
        </div>
      </GlassContainer>
    </main>
  );
}
