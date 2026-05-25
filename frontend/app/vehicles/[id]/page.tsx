import VehicleDetails from "./vehicleDetails";

type VehicleDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VehicleDetailsPage({
  params,
}: VehicleDetailsPageProps) {
  const { id } = await params;

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <VehicleDetails vehicleId={id} />
    </main>
  );
}
