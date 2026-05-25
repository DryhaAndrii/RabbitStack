import EditVehicleForm from "./editVehicleForm";

type EditVehiclePageProps = {
  searchParams: Promise<{
    vehicleId?: string;
  }>;
};

export default async function EditVehiclePage({
  searchParams,
}: EditVehiclePageProps) {
  const { vehicleId = "" } = await searchParams;

  return <EditVehicleForm vehicleId={vehicleId} />;
}
