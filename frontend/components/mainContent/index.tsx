"use client";

import AddVehicleToUser from "./AddVehicleToUser";
import CreateUserForm from "./CreateUserForm";
import EditUser from "./EditUser";
import EditVehicle from "./EditVehicle";
import MainContentIdle from "./idle";
import UserInfo from "./UserInfo";
import VehicleInfo from "./VehicleInfo";

export default function MainContent() {
  return (
    <div className="grow">
      <CreateUserForm />
      <AddVehicleToUser />
      <EditUser />
      <EditVehicle />
      <MainContentIdle />
      <UserInfo />
      <VehicleInfo />
    </div>
  );
}
