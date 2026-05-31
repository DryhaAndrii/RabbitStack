"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useUserInfo } from "../mainContent/UserInfo/api";
import AnimatedList from "../surfaces/AnimatedList";

type VehiclesResponse = {
  items: Array<{
    id: number;
    make: string | null;
    model: string | null;
    year: number | null;
    user_id: string;
    created_at: string;
    updated_at: string;
  }>;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

async function fetchVehicles(userId: string): Promise<VehiclesResponse> {
  const params = new URLSearchParams({
    page: "1",
    limit: "10",
  });

  if (userId) {
    params.set("user_id", userId);
  }

  const response = await fetch(`/api/vehicles?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to load vehicles");
  }

  return response.json();
}

export default function VehiclesList() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") ?? "";
  const isSelectedUserMode = userId !== "";
  const { data: selectedUser } = useUserInfo(userId);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["recentVehicles", userId],
    queryFn: () => fetchVehicles(userId),
  });

  const vehicleItems =
    data?.items.map((vehicle) => ({
      id: vehicle.id,
      label: formatVehicleLabel(vehicle),
      href: `/?vehicleId=${vehicle.id}`,
    })) ?? [];

  return (
    <div className="relative flex min-h-[400px] w-[300px] self-stretch flex-col border border-cyan-300/25 bg-slate-950/35 p-4 shadow-[0_0_0_1px_rgba(125,249,255,0.06),0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-sm">
      <h1 className="text-xl font-semibold tracking-tight text-white ">
        {isSelectedUserMode
          ? selectedUser?.email
            ? `${selectedUser.email} vehicles`
            : "Selected user vehicles"
          : "Recent vehicles"}
      </h1>
      <div className="mt-4 min-h-0 w-full flex-1">
        {isLoading ? (
          <div className="flex h-full items-center justify-center px-4 text-sm text-zinc-400">
            {isSelectedUserMode
              ? "Loading selected user vehicles..."
              : "Loading vehicles..."}
          </div>
        ) : isError ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-rose-300">
            {isSelectedUserMode
              ? "Could not load vehicles for this user."
              : "Could not load vehicles from the backend."}
          </div>
        ) : vehicleItems.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4 text-sm text-zinc-400">
            {isSelectedUserMode
              ? "This user has no vehicles yet."
              : "No vehicles yet."}
          </div>
        ) : (
          <AnimatedList
            items={vehicleItems}
            onItemSelect={(item, index) => console.log(item, index)}
            showGradients={false}
            displayScrollbar={false}
          />
        )}
      </div>
    </div>
  );
}

function formatVehicleLabel(vehicle: VehiclesResponse["items"][number]) {
  const make = vehicle.make ?? "Unknown";
  const model = vehicle.model ?? "Unknown";
  const year = vehicle.year ?? "Unknown";

  return `${make} ${model} (${year})`;
}
