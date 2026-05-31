"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";

type StatusType = "idle" | "success" | "error";

type VehicleInfoData = {
  id: number;
  make: string | null;
  model: string | null;
  year: number | null;
  user_id: string;
  created_at: string;
  updated_at: string;
};

type UpdateVehiclePayload = {
  make: string | null;
  model: string | null;
  year: number | null;
  user_id: string;
};

type UpdateVehicleResponse = {
  message?: string | string[];
  vehicle?: VehicleInfoData;
};

async function fetchVehicle(id: string): Promise<VehicleInfoData> {
  const response = await fetch(`/api/vehicles/${id}`);

  if (!response.ok) {
    throw new Error("Failed to load vehicle");
  }

  return response.json() as Promise<VehicleInfoData>;
}

async function updateVehicle(
  vehicleId: string,
  payload: UpdateVehiclePayload,
): Promise<UpdateVehicleResponse> {
  const response = await fetch(`/api/vehicles/${vehicleId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as UpdateVehicleResponse;

  if (!response.ok) {
    const backendMessage = Array.isArray(data.message)
      ? data.message[0]
      : data.message;

    throw new Error(backendMessage || "Failed to update vehicle");
  }

  return data;
}

export function useEditVehicleForm(vehicleId: string) {
  const queryClient = useQueryClient();
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [userId, setUserId] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<StatusType>("idle");

  const vehicleQuery = useQuery({
    queryKey: ["vehicle-info", vehicleId],
    queryFn: () => fetchVehicle(vehicleId),
    enabled: vehicleId.length > 0,
    retry: false,
  });

  useEffect(() => {
    if (!vehicleQuery.data) {
      return;
    }

    setMake(vehicleQuery.data.make ?? "");
    setModel(vehicleQuery.data.model ?? "");
    setYear(vehicleQuery.data.year === null ? "" : String(vehicleQuery.data.year));
    setUserId(vehicleQuery.data.user_id);
  }, [vehicleQuery.data]);

  const updateVehicleMutation = useMutation({
    mutationFn: (payload: UpdateVehiclePayload) => updateVehicle(vehicleId, payload),
    onSuccess: async (data) => {
      setStatusType("success");
      setStatusMessage(
        data.message
          ? `${data.message}${data.vehicle?.id ? `: #${data.vehicle.id}` : ""}`
          : "Vehicle updated successfully",
      );

      await queryClient.invalidateQueries({ queryKey: ["vehicle-info", vehicleId] });
      await queryClient.invalidateQueries({ queryKey: ["vehicle-details", vehicleId] });
      await queryClient.invalidateQueries({ queryKey: ["recentVehicles"] });
      await queryClient.invalidateQueries({ queryKey: ["user-vehicles", userId] });
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "Could not reach backend. Check nginx/auth-service routing.";

      setStatusType("error");
      setStatusMessage(message);
    },
  });

  const handleMakeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMake(event.target.value);
  };

  const handleModelChange = (event: ChangeEvent<HTMLInputElement>) => {
    setModel(event.target.value);
  };

  const handleYearChange = (event: ChangeEvent<HTMLInputElement>) => {
    setYear(event.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setStatusMessage(null);
    setStatusType("idle");

    if (!vehicleId) {
      setStatusType("error");
      setStatusMessage("Vehicle id is missing in the URL.");
      return;
    }

    if (!userId) {
      setStatusType("error");
      setStatusMessage("Vehicle owner is missing.");
      return;
    }

    try {
      await updateVehicleMutation.mutateAsync({
        make: normalizeOptionalText(make),
        model: normalizeOptionalText(model),
        year: normalizeOptionalYear(year),
        user_id: userId,
      });
    } catch {
      // The mutation onError handler already maps backend errors to form UI state.
    }
  };

  return {
    make,
    model,
    year,
    userId,
    handleMakeChange,
    handleModelChange,
    handleYearChange,
    handleSubmit,
    isSubmitting: updateVehicleMutation.isPending,
    isLoadingVehicle: vehicleQuery.isLoading,
    isVehicleError: vehicleQuery.isError,
    statusMessage,
    statusType,
  };
}

function normalizeOptionalText(value: string) {
  const normalizedValue = value.trim();
  return normalizedValue === "" ? null : normalizedValue;
}

function normalizeOptionalYear(value: string) {
  const normalizedValue = value.trim();

  if (normalizedValue === "") {
    return null;
  }

  return Number(normalizedValue);
}
