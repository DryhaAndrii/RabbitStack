"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type VehicleDetailsData = {
  id: number;
  make: string | null;
  model: string | null;
  year: number | null;
  user_id: string;
  created_at: string;
  updated_at: string;
};

type DeleteVehicleResponse = {
  message?: string | string[];
  vehicle?: {
    id: number;
    user_id: string;
  };
};

async function fetchVehicleDetails(id: string): Promise<VehicleDetailsData> {
  const response = await fetch(`/api/vehicles/${id}`);

  if (!response.ok) {
    throw new Error("Failed to load vehicle");
  }

  return response.json() as Promise<VehicleDetailsData>;
}

export function useVehicleDetails(id: string) {
  return useQuery({
    queryKey: ["vehicle-details", id],
    queryFn: () => fetchVehicleDetails(id),
    enabled: id.length > 0,
  });
}

async function deleteVehicle(id: string): Promise<DeleteVehicleResponse> {
  const response = await fetch(`/api/vehicles/${id}`, {
    method: "DELETE",
  });

  const data = (await response.json()) as DeleteVehicleResponse;

  if (!response.ok) {
    const backendMessage = Array.isArray(data.message)
      ? data.message[0]
      : data.message;

    throw new Error(backendMessage || "Failed to delete vehicle");
  }

  return data;
}

export function useDeleteVehicle(vehicleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteVehicle(vehicleId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["recentVehicles"] });
      await queryClient.invalidateQueries({ queryKey: ["user-vehicles"] });
    },
  });
}
