'use client';

import type { InputHTMLAttributes } from "react";

type InputProps = {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
} & InputHTMLAttributes<HTMLInputElement>;

function joinClasses(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

export default function Input({
  label,
  hint,
  error,
  className,
  containerClassName,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className={joinClasses("flex w-full flex-col gap-2", containerClassName)}>
      {label ? (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-300"
        >
          {label}
        </label>
      ) : null}

      <input
        id={inputId}
        className={joinClasses(
          "h-12 w-full border border-white/15 bg-white/8 px-4 text-sm text-white outline-none transition-colors",
          "placeholder:text-zinc-500 focus:border-cyan-300/55 focus:bg-white/12",
          className,
        )}
        {...props}
      />

      {error ? (
        <p className="text-sm text-rose-300">{error}</p>
      ) : hint ? (
        <p className="text-sm text-zinc-400">{hint}</p>
      ) : null}
    </div>
  );
}
