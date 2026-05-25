"use client";

import Link from "next/link";
import Button from "@/components/Button";
import Input from "@/components/Input";
import GlassContainer from "@/components/surfaces/GlassContainer";
import { useEditUserForm } from "./api";

type EditUserFormProps = {
  userId: string;
};

export default function EditUserForm({ userId }: EditUserFormProps) {
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

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <GlassContainer className="w-full max-w-xl">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Edit User
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Update user
            </h1>
          </div>

          {isLoadingUser ? (
            <div className="rounded-[28px] border border-white/10 bg-white/5 px-5 py-8 text-center text-sm text-zinc-300">
              Loading user...
            </div>
          ) : isUserError ? (
            <div className="rounded-[28px] border border-rose-400/20 bg-rose-400/10 px-5 py-8 text-center text-sm text-rose-200">
              Could not load user data.
            </div>
          ) : (
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <Input
                name="user_id"
                label="User ID"
                value={userId}
                hint="This user id comes from the previous page."
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

                  {userId ? (
                    <Link
                      href={`/users/${userId}`}
                      className="inline-flex h-12 items-center justify-center border border-white/15 bg-white/8 px-5 text-sm font-semibold uppercase tracking-[0.22em] text-zinc-100 transition-colors hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45"
                    >
                      Back to user
                    </Link>
                  ) : null}
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
    </main>
  );
}
