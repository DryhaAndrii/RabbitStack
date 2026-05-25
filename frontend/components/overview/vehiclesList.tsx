"use client";

import { useQuery } from "@tanstack/react-query";
import AnimatedList from "../surfaces/AnimatedList";
import ElectricBorder from "../surfaces/ElectricBorder";

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

async function fetchVehicles(): Promise<VehiclesResponse> {
  const response = await fetch("/api/vehicles?page=1&limit=10");

  if (!response.ok) {
    throw new Error("Failed to load vehicles");
  }

  return response.json();
}

export default function VehiclesList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["recentVehicles"],
    queryFn: fetchVehicles,
  });

  const vehicleItems =
    data?.items.map((vehicle) => ({
      id: vehicle.id,
      label: formatVehicleLabel(vehicle),
      href: `/vehicles/${vehicle.id}`,
    })) ?? [];

  return (
    <ElectricBorder
      color="#7df9ff"
      speed={1}
      chaos={0.12}
      thickness={2}
      style={{ borderRadius: 16 }}
      className="w-[300px] h-[350px] p-4"
    >
      <h1 className="text-xl font-semibold tracking-tight text-white ">
        Recent vehicles
      </h1>
      <div className="w-full h-[300px]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center px-4 text-sm text-zinc-400">
            Loading vehicles...
          </div>
        ) : isError ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-rose-300">
            Could not load vehicles from the backend.
          </div>
        ) : vehicleItems.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4 text-sm text-zinc-400">
            No vehicles yet.
          </div>
        ) : (
          <AnimatedList
            items={vehicleItems}
            onItemSelect={(item, index) => console.log(item, index)}
            showGradients={false}
            enableArrowNavigation
            displayScrollbar={false}
          />
        )}
      </div>
    </ElectricBorder>
  );
}

function formatVehicleLabel(vehicle: VehiclesResponse["items"][number]) {
  const make = vehicle.make ?? "Unknown";
  const model = vehicle.model ?? "Unknown";
  const year = vehicle.year ?? "Unknown";

  return `${make} ${model} (${year})`;
}
