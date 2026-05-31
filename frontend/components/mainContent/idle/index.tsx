"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import GlassContainer from "@/components/surfaces/GlassContainer";

export default function MainContentIdle() {
  const searchParams = useSearchParams();

  const userId = searchParams.get("userId");
  const vehicleId = searchParams.get("vehicleId");
  const createUser = searchParams.get("createUser") === "true";
  const addVehicle = searchParams.get("addVehicle") === "true";
  const editUser = searchParams.get("editUser") === "true";
  const editVehicle = searchParams.get("editVehicle") === "true";

  const hasActiveSelection =
    Boolean(userId) ||
    Boolean(vehicleId) ||
    createUser ||
    addVehicle ||
    editUser ||
    editVehicle;

  if (hasActiveSelection) {
    return null;
  }

  return (
    <GlassContainer className="min-h-[400px]">
      <div className="flex h-full flex-col justify-between gap-8">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
            Overview Panel
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Everything starts here
          </h2>
          <p className="max-w-xl text-sm leading-6 text-zinc-300">
            Select a user on the left, open a vehicle on the right, or start a
            new workflow from the top navigation. This center panel will show
            the main action you are working on.
          </p>
        </div>

        <div className="grid gap-3">
          <HintCard
            title="Users"
            description="Open a user to inspect details, edit the profile, or add a vehicle."
          />
          <HintCard
            title="Vehicles"
            description="Pick a vehicle to review compact details or remove it from the system."
          />
          <HintCard
            title="Quick start"
            description="Use New user in the header to create a user directly inside this panel."
            action={
              <Link
                href="/?createUser=true"
                className="inline-flex h-11 items-center justify-center border border-cyan-300/30 bg-cyan-300/12 px-4 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100 transition-colors hover:bg-cyan-300/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45"
              >
                Create user
              </Link>
            }
          />
        </div>
      </div>
    </GlassContainer>
  );
}

function HintCard({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="border border-white/10 bg-white/5 px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-200/55">
            {title}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">{description}</p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </section>
  );
}
