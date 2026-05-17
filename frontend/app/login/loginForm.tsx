"use client";

import Button from "@/components/Button";
import Input from "@/components/Input";
import { useLoginForm } from "./loginForm.api";

export default function LoginForm() {
  const {
    email,
    password,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    isSubmitting,
    fieldError,
    statusMessage,
  } = useLoginForm();

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Login
        </h2>
      </div>

      <Input
        name="email"
        type="email"
        label="Email"
        placeholder="user@example.com"
        autoComplete="email"
        hint="Enter the credentials of an existing account."
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
        placeholder="Enter your password"
        autoComplete="current-password"
        value={password}
        onChange={handlePasswordChange}
        disabled={isSubmitting}
        required
      />

      <div className="flex items-center justify-between gap-4">
        <p className={fieldError ? "text-sm text-rose-300" : "text-sm text-zinc-400"}>
          {statusMessage || "Sign in to continue to the application."}
        </p>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Login"}
        </Button>
      </div>
    </form>
  );
}
