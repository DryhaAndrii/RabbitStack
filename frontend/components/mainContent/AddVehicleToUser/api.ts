"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";

type StatusType = "idle" | "success" | "error";

type CreateVehiclePayload = {
  make: string | null;
  model: string | null;
  year: number | null;
  user_id: string;
};

type CreateVehicleResponse = {
  message?: string | string[];
  vehicle?: {
    id: number;
    make: string | null;
    model: string | null;
    year: number | null;
    user_id: string;
  };
};

async function createVehicle(
  payload: CreateVehiclePayload,
): Promise<CreateVehicleResponse> {
  const response = await fetch("/api/vehicles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as CreateVehicleResponse;

  if (!response.ok) {
    const backendMessage = Array.isArray(data.message)
      ? data.message[0]
      : data.message;

    throw new Error(backendMessage || "Failed to save vehicle");
  }

  return data;
}

export function useAddVehicleToUserForm(userId: string) {
  const queryClient = useQueryClient();
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<StatusType>("idle");

  const createVehicleMutation = useMutation({
    mutationFn: createVehicle,
    onSuccess: async (data) => {
      setStatusType("success");
      setStatusMessage(
        data.message
          ? `${data.message}${data.vehicle?.id ? `: #${data.vehicle.id}` : ""}`
          : "Vehicle saved successfully",
      );
      setMake("");
      setModel("");
      setYear("");

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

    if (!userId) {
      setStatusType("error");
      setStatusMessage("User id is missing in the URL.");
      return;
    }

    try {
      await createVehicleMutation.mutateAsync({
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
    handleMakeChange,
    handleModelChange,
    handleYearChange,
    handleSubmit,
    isSubmitting: createVehicleMutation.isPending,
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
