import Link from "next/link";
import type { UserListItemData } from "./usersList.logic";

type UserListItemProps = {
  user: UserListItemData;
};

export default function UserListItem({ user }: UserListItemProps) {
  return (
    <Link
      href={`/users/${user.id}`}
      className="block rounded-[28px] border border-white/12 bg-white/6 p-4 backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-cyan-300/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-lg font-semibold tracking-tight break-all text-white">
            {user.email}
          </p>
          <p className="mt-2 text-[11px] tracking-[0.24em] text-cyan-200/55 uppercase">
            User ID
          </p>
          <p className="mt-1 text-sm break-all text-zinc-400">{user.id}</p>
        </div>

        <div className="grid gap-2 rounded-2xl border border-cyan-300/10 bg-slate-950/35 px-4 py-3 text-sm text-zinc-300 md:min-w-60">
          <p>Created {formatDate(user.createdAt)}</p>
          <p className="text-zinc-500">Updated {formatDate(user.updatedAt)}</p>
        </div>
      </div>
    </Link>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
