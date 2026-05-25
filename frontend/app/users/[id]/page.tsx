import UserDetails from "./userDetails";

type UserDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UserDetailsPage({
  params,
}: UserDetailsPageProps) {
  const { id } = await params;

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <UserDetails userId={id} />
    </main>
  );
}
