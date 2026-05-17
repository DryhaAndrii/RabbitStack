import { motion } from "framer-motion";
import type { AuthMode } from "./AuthForms";

interface Props {
  setMode: (string: AuthMode) => void;
  mode: AuthMode;
}

export default function Switcher({ setMode, mode }: Props) {
  return (
    <div className="relative inline-flex w-full border border-white/10 bg-slate-950/35 p-1">
      <motion.div
        layout
        initial={false}
        animate={{
          x: mode === "login" ? "0%" : "100%",
        }}
        transition={{
          type: "spring",
          stiffness: 360,
          damping: 32,
          mass: 0.9,
        }}
        className="pointer-events-none absolute inset-y-1 left-1 z-0 w-[calc(50%-0.25rem)] border border-cyan-300/30 bg-cyan-300/14 shadow-[0_0_30px_rgba(34,211,238,0.12)]"
      />

      <button
        type="button"
        onClick={() => setMode("login")}
        className={
          mode === "login"
            ? "relative z-10 flex-1 px-4 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100 transition-colors"
            : "relative z-10 flex-1 px-4 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-zinc-400 transition-colors hover:text-zinc-200"
        }
      >
        <motion.span
          animate={{ scale: mode === "login" ? 1 : 0.985 }}
          transition={{ duration: 0.18 }}
          className="inline-block"
        >
          Login
        </motion.span>
      </button>
      <button
        type="button"
        onClick={() => setMode("register")}
        className={
          mode === "register"
            ? "relative z-10 flex-1 px-4 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100 transition-colors"
            : "relative z-10 flex-1 px-4 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-zinc-400 transition-colors hover:text-zinc-200"
        }
      >
        <motion.span
          animate={{ scale: mode === "register" ? 1 : 0.985 }}
          transition={{ duration: 0.18 }}
          className="inline-block"
        >
          Register
        </motion.span>
      </button>
    </div>
  );
}
