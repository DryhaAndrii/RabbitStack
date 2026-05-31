"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import Button from "@/components/Button";
import Input from "@/components/Input";
import GlassContainer from "@/components/surfaces/GlassContainer";
import { useEditUserForm } from "./api";

export default function EditUser() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") ?? "";
  const editUser = searchParams.get("editUser") === "true";

  const {
    email,
    emailError,
    handleEmailChange,
    handleSubmit,
    isSubmitting,
    isLoadingUser,
    isUserError,
    statusMessage,
    statusType,
  } = useEditUserForm(userId);

  if (!editUser || !userId) {
    return null;
  }

  return (
    <GlassContainer className="min-h-[400px]">
      <div className="flex h-full flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
            Edit User
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Update user
          </h2>
          <p className="text-sm text-zinc-400">
            Edit the selected user directly inside the overview panel.
          </p>
        </div>

        {isLoadingUser ? (
          <div className="border border-white/10 bg-white/5 px-5 py-8 text-center text-sm text-zinc-300">
            Loading user...
          </div>
        ) : isUserError ? (
          <div className="border border-rose-400/20 bg-rose-400/10 px-5 py-8 text-center text-sm text-rose-200">
            Could not load user data.
          </div>
        ) : (
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <Input
              name="user_id"
              label="User ID"
              value={userId}
              hint="This user id comes from the selected user in overview."
              readOnly
            />

            <Input
              name="email"
              type="email"
              label="Email"
              placeholder="user@example.com"
              autoComplete="email"
              hint="Update the user email and save changes."
              error={emailError ?? undefined}
              value={email}
              onChange={handleEmailChange}
              required
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting || userId === ""}>
                  {isSubmitting ? "Saving..." : "Save user"}
                </Button>

                <Link
                  href={`/?userId=${encodeURIComponent(userId)}`}
                  className="inline-flex h-12 items-center justify-center border border-white/15 bg-white/8 px-5 text-sm font-semibold uppercase tracking-[0.22em] text-zinc-100 transition-colors hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45"
                >
                  Back to user
                </Link>
              </div>

              {statusMessage ? (
                <p
                  className={
                    statusType === "error"
                      ? "text-sm text-rose-300"
                      : "text-sm text-emerald-300"
                  }
                >
                  {statusMessage}
                </p>
              ) : null}
            </div>
          </form>
        )}
      </div>
    </GlassContainer>
  );
}
