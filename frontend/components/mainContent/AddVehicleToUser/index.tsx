"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import Button from "@/components/Button";
import Input from "@/components/Input";
import GlassContainer from "@/components/surfaces/GlassContainer";
import { useAddVehicleToUserForm } from "./api";

export default function AddVehicleToUser() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") ?? "";
  const addVehicle = searchParams.get("addVehicle") === "true";

  const {
    make,
    model,
    year,
    handleMakeChange,
    handleModelChange,
    handleYearChange,
    handleSubmit,
    isSubmitting,
    statusMessage,
    statusType,
  } = useAddVehicleToUserForm(userId);

  if (!addVehicle || !userId) {
    return null;
  }

  return (
    <GlassContainer className="min-h-[400px]">
      <div className="flex h-full flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
            Create Vehicle
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Add a new vehicle
          </h2>
          <p className="text-sm text-zinc-400">
            Vehicle will be created for the selected user inside the overview
            panel.
          </p>
        </div>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <Input
            name="user_id"
            label="User ID"
            value={userId}
            hint="This user id comes from the selected user in overview."
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
              <Button type="submit" disabled={isSubmitting || userId === ""}>
                {isSubmitting ? "Sending..." : "Create vehicle"}
              </Button>

              <Link
                href={`/?userId=${encodeURIComponent(userId)}`}
                className="inline-flex h-12 items-center justify-center border border-white/15 bg-white/8 px-5 text-sm font-semibold uppercase tracking-[0.22em] text-zinc-100 transition-colors hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45"
              >
                Back to user
              </Link>
            </div>

            {statusMessage ? (
              <p
                className={
                  statusType === "error"
                    ? "text-sm text-rose-300 text-[10px]"
                    : "text-sm text-emerald-300 text-[10px]"
                }
              >
                {statusMessage}
              </p>
            ) : null}
          </div>
        </form>
      </div>
    </GlassContainer>
  );
}
