"use client";

import Button from "@/components/Button";
import Input from "@/components/Input";
import GlassContainer from "@/components/surfaces/GlassContainer";
import { useCreateUserForm } from "./api";

export default function CreateUser() {
  const {
    email,
    emailError,
    handleEmailChange,
    handleSubmit,
    isSubmitting,
    statusMessage,
    statusType,
  } = useCreateUserForm();

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <GlassContainer className="w-full max-w-xl">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Create User
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Add a new user
            </h1>
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <Input
              name="email"
              type="email"
              label="Email"
              placeholder="user@example.com"
              autoComplete="email"
              hint="Use a valid email format for the future create-user flow."
              error={emailError ?? undefined}
              value={email}
              onChange={handleEmailChange}
              required
            />

            <div className="flex items-center justify-between gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Create user"}
              </Button>

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
        </div>
      </GlassContainer>
    </main>
  );
}
