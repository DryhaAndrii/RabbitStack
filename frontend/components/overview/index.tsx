"use client";

import AnimatedList from "../surfaces/AnimatedList";
import ElectricBorder from "../surfaces/ElectricBorder";
import UsersList from "./usersList";

const mockVehicles = [
  "Toyota Supra MK4",
  "Nissan Skyline GT-R R34",
  "BMW M3 E46",
  "Audi RS6 Avant",
  "Mercedes-Benz AMG GT",
  "Ford Mustang Shelby GT500",
  "Chevrolet Camaro ZL1",
  "Dodge Challenger Hellcat",
  "Porsche 911 Turbo S",
  "Lamborghini HuracГЎn EVO",
  "Ferrari F8 Tributo",
  "McLaren 720S",
  "Subaru Impreza WRX STI",
  "Mitsubishi Lancer Evolution IX",
  "Honda Civic Type R",
  "Mazda RX-7 FD",
  "Tesla Model S Plaid",
  "Jeep Grand Cherokee Trackhawk",
  "Range Rover Sport SVR",
  "Aston Martin DBS Superleggera",
];

export default function Overview() {
  return (
    <div className="h-[400px] w-full flex  gap-4 flex-col">
      <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        Overview
      </h1>
      <div className="mt-4 flex justify-between">
        <UsersList />

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
            <AnimatedList
              items={mockVehicles}
              onItemSelect={(item, index) => console.log(item, index)}
              showGradients={false}
              displayScrollbar={false}
              enableArrowNavigation
            />
          </div>
        </ElectricBorder>
      </div>
    </div>
  );
}
