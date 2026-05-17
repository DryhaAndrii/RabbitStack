"use client";

import Button from "@/components/Button";
import Input from "@/components/Input";
import { useRegisterForm } from "./registerForm.api";

export default function RegisterForm() {
  const {
    email,
    password,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    isSubmitting,
    fieldError,
    statusMessage,
  } = useRegisterForm();

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Register
        </h2>
      </div>

      <Input
        name="email"
        type="email"
        label="Email"
        placeholder="user@example.com"
        autoComplete="email"
        hint="We will create the user and open the app right away."
        value={email}
        onChange={handleEmailChange}
        error={fieldError ?? undefined}
        disabled={isSubmitting}
        required
      />

      <Input
        name="password"
        type="password"
        label="Password"
        placeholder="Create a password"
        autoComplete="new-password"
        value={password}
        onChange={handlePasswordChange}
        disabled={isSubmitting}
        required
      />

      <div className="flex items-center justify-between gap-4">
        <p
          className={
            fieldError
              ? "text-sm text-rose-300"
              : "text-sm text-zinc-400"
          }
        >
          {statusMessage || "Create an account to enter the application."}
        </p>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Register"}
        </Button>
      </div>
    </form>
  );
}
