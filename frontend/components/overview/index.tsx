"use client";

import MainContent from "../mainContent";
import UsersList from "./usersList";
import VehiclesList from "./vehiclesList";

export default function Overview() {
  return (
    <div className="min-h-[400px] w-full flex gap-4 flex-col">
      <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        Overview
      </h1>
      <div className="mt-4 flex items-stretch justify-between gap-4">
        <UsersList />
        <MainContent />
        <VehiclesList />
      </div>
    </div>
  );
}
