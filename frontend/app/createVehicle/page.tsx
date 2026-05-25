import CreateVehicleForm from "./createVehicleForm";

type CreateVehiclePageProps = {
  searchParams: Promise<{
    userId?: string;
  }>;
};

export default async function CreateVehiclePage({
  searchParams,
}: CreateVehiclePageProps) {
  const { userId = "" } = await searchParams;

  return <CreateVehicleForm userId={userId} />;
}
