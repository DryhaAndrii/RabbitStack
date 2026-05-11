'use client';
import AnimatedList from "./AnimatedList";

const mockUsers = [
    'Liam Carter',
    'Emma Walker',
    'Noah Bennett',
    'Olivia Turner',
    'Ethan Brooks',
    'Sophia Reed',
    'Mason Cooper',
    'Isabella Hayes',
    'Lucas Foster',
    'Mia Richardson',
    'James Peterson',
    'Charlotte Simmons',
    'Benjamin Ward',
    'Amelia Price',
    'Henry Coleman',
    'Evelyn Hughes',
    'Alexander Ross',
    'Harper Bryant',
    'Daniel Sanders',
    'Abigail Jenkins'
]

const mockVehicles = [
    'Toyota Supra MK4',
    'Nissan Skyline GT-R R34',
    'BMW M3 E46',
    'Audi RS6 Avant',
    'Mercedes-Benz AMG GT',
    'Ford Mustang Shelby GT500',
    'Chevrolet Camaro ZL1',
    'Dodge Challenger Hellcat',
    'Porsche 911 Turbo S',
    'Lamborghini Huracán EVO',
    'Ferrari F8 Tributo',
    'McLaren 720S',
    'Subaru Impreza WRX STI',
    'Mitsubishi Lancer Evolution IX',
    'Honda Civic Type R',
    'Mazda RX-7 FD',
    'Tesla Model S Plaid',
    'Jeep Grand Cherokee Trackhawk',
    'Range Rover Sport SVR',
    'Aston Martin DBS Superleggera'
]

export default function Overview() {

    return (
        <div className="h-[400px] w-full flex  gap-4 flex-col">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Overview
            </h1>
            <div className="flex justify-between mt-4">
                <div className="w-[400px] h-[250px]">
                    <h1 className="text-xl font-semibold tracking-tight text-white ">
                        Recent users
                    </h1>
                    <AnimatedList
                        items={mockUsers}
                        onItemSelect={(item, index) => console.log(item, index)}
                        showGradients
                        enableArrowNavigation
                        displayScrollbar
                    />
                </div>

                <div className="w-[400px] h-[250px]">
                    <h1 className="text-xl font-semibold tracking-tight text-white ">
                        Recent vehicles
                    </h1>
                    <AnimatedList
                        items={mockVehicles}
                        onItemSelect={(item, index) => console.log(item, index)}
                        showGradients
                        enableArrowNavigation
                        displayScrollbar
                    />
                </div></div>



        </div>)
}