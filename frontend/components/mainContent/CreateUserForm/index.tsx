"use client";

import { useSearchParams } from "next/navigation";

import Button from "@/components/Button";
import Input from "@/components/Input";
import GlassContainer from "@/components/surfaces/GlassContainer";
import { useCreateUserForm } from "./api";

export default function CreateUserForm() {
  const searchParams = useSearchParams();
  const createUser = searchParams.get("createUser") === "true";

  const {
    email,
    emailError,
    handleEmailChange,
    handleSubmit,
    isSubmitting,
    statusMessage,
    statusType,
  } = useCreateUserForm();

  if (!createUser) {
    return null;
  }

  return (
    <GlassContainer className=" p-0 sm:p-0">
      <div className="flex h-full flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
            Create User
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Add a new user
          </h2>
          <p className="max-w-xl text-sm leading-6 text-zinc-300">
            Create a user directly from the overview panel. Once saved, the
            users list on the left will refresh automatically.
          </p>
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

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="md:min-w-48"
            >
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
  );
}
