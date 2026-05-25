import EditUserForm from "./editUserForm";

type EditUserPageProps = {
  searchParams: Promise<{
    userId?: string;
  }>;
};

export default async function EditUserPage({
  searchParams,
}: EditUserPageProps) {
  const { userId = "" } = await searchParams;

  return <EditUserForm userId={userId} />;
}
