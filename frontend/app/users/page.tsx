import GlassContainer from "@/components/surfaces/GlassContainer";
import UsersList from "./usersList";

export default function UsersPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-4">
      <GlassContainer className="w-full">
        <UsersList />
      </GlassContainer>
    </main>
  );
}
