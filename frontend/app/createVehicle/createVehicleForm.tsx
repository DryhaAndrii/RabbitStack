"use client";

import Link from "next/link";
import Button from "@/components/Button";
import Input from "@/components/Input";
import GlassContainer from "@/components/surfaces/GlassContainer";
import { useCreateVehicleForm } from "./api";

type CreateVehicleFormProps = {
  userId: string;
};

export default function CreateVehicleForm({
  userId,
}: CreateVehicleFormProps) {
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
  } = useCreateVehicleForm(userId);

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <GlassContainer className="w-full max-w-xl">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Create Vehicle
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Add a new vehicle
            </h1>
            <p className="text-sm text-zinc-400">
              Vehicle will be created for the selected user.
            </p>
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <Input
              name="user_id"
              label="User ID"
              value={userId}
              hint="This user id comes from the previous page."
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

                {userId ? (
                  <Link
                    href={`/users/${userId}`}
                    className="inline-flex h-12 items-center justify-center border border-white/15 bg-white/8 px-5 text-sm font-semibold uppercase tracking-[0.22em] text-zinc-100 transition-colors hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45"
                  >
                    Back to user
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
        </div>
      </GlassContainer>
    </main>
  );
}
